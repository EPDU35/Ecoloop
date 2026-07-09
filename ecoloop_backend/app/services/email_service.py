"""
Service d'envoi d'emails transactionnels via Brevo (ex-Sendinblue).

Deux modes supportés :
  - SMTP relay (smtp-relay.brevo.com) via aiosmtplib, avec une clé SMTP xsmtpsib-...
  - API HTTP (https://api.brevo.com/v3/smtp/email) avec une clé API xkeysib-...
Le mode SMTP est prioritaire s'il est configuré.

Le service est "fail-safe" : si rien n'est configuré ou si l'envoi échoue,
l'erreur est journalisée mais n'interrompt pas le flux appelant.
"""
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from typing import Optional

import aiosmtplib
import httpx

from app.config.settings import settings

logger = logging.getLogger("ecoloop.email_service")

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


class EmailService:
    def __init__(self) -> None:
        self.api_key = settings.brevo_api_key
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_login = settings.smtp_login
        self.smtp_password = settings.smtp_password
        self.sender_name = settings.email_sender_name
        self.sender_email = settings.email_sender_email

    @property
    def smtp_configured(self) -> bool:
        return bool(self.smtp_login and self.smtp_password and self.sender_email)

    @property
    def api_configured(self) -> bool:
        return bool(self.api_key and self.sender_email)

    @property
    def is_configured(self) -> bool:
        return self.smtp_configured or self.api_configured

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        to_name: Optional[str] = None,
        text_content: Optional[str] = None,
    ) -> bool:
        """Envoie un email. Utilise SMTP en priorité, sinon l'API HTTP Brevo."""
        if self.smtp_configured:
            return await self._send_smtp(to_email, subject, html_content, to_name, text_content)
        if self.api_configured:
            return await self._send_api(to_email, subject, html_content, to_name, text_content)
        logger.warning(
            "Email non configuré (ni SMTP ni API Brevo). Email vers %s non envoyé : %s",
            to_email,
            subject,
        )
        return False

    async def _send_smtp(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        to_name: Optional[str],
        text_content: Optional[str],
    ) -> bool:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = formataddr((self.sender_name, self.sender_email))
        message["To"] = formataddr((to_name, to_email)) if to_name else to_email
        if text_content:
            message.attach(MIMEText(text_content, "plain", "utf-8"))
        message.attach(MIMEText(html_content, "html", "utf-8"))

        try:
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                start_tls=True,
                username=self.smtp_login,
                password=self.smtp_password,
                timeout=15,
            )
            logger.info("Email SMTP envoyé à %s (%s)", to_email, subject)
            return True
        except Exception as exc:  # noqa: BLE001
            logger.error("Erreur envoi SMTP à %s : %s", to_email, exc)
            return False

    async def _send_api(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        to_name: Optional[str],
        text_content: Optional[str],
    ) -> bool:
        payload = {
            "sender": {"name": self.sender_name, "email": self.sender_email},
            "to": [{"email": to_email, **({"name": to_name} if to_name else {})}],
            "subject": subject,
            "htmlContent": html_content,
        }
        if text_content:
            payload["textContent"] = text_content

        headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json",
            "accept": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(BREVO_API_URL, json=payload, headers=headers)
            if resp.status_code in (200, 201, 202):
                logger.info("Email API Brevo envoyé à %s (%s)", to_email, subject)
                return True
            logger.error(
                "Echec envoi API Brevo à %s : %s %s",
                to_email,
                resp.status_code,
                resp.text,
            )
            return False
        except Exception as exc:  # noqa: BLE001
            logger.error("Erreur envoi API Brevo à %s : %s", to_email, exc)
            return False

    async def send_otp_email(self, to_email: str, code: str, to_name: Optional[str] = None) -> bool:
        """Envoie le code de vérification (OTP) d'inscription."""
        subject = "Votre code de vérification EcoLoop"
        html_content = f"""
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:auto;color:#1a1a1a">
          <h2 style="color:#159c5b">EcoLoop ♻️</h2>
          <p>Bonjour{(' ' + to_name) if to_name else ''},</p>
          <p>Voici votre code de vérification pour activer votre compte :</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:8px;
                    background:#f2f7f4;padding:16px;text-align:center;border-radius:8px">
            {code}
          </p>
          <p>Ce code est valable <strong>10 minutes</strong>.</p>
          <p style="color:#888;font-size:13px">Si vous n'êtes pas à l'origine de cette demande,
             ignorez cet email.</p>
        </div>
        """
        text_content = (
            f"Votre code de vérification EcoLoop est : {code}. "
            "Il est valable 10 minutes."
        )
        return await self.send_email(to_email, subject, html_content, to_name, text_content)

    async def send_account_approved_email(self, to_email: str, to_name: Optional[str] = None) -> bool:
        """Prévient un professionnel que son compte a été validé par un admin."""
        subject = "Votre compte EcoLoop est activé ✅"
        login_link = f"{settings.frontend_url.rstrip('/')}/connexion"
        html_content = f"""
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:auto;color:#1a1a1a">
          <h2 style="color:#159c5b">EcoLoop ♻️</h2>
          <p>Bonjour{(' ' + to_name) if to_name else ''},</p>
          <p>Bonne nouvelle : votre compte professionnel a été <strong>validé</strong>
             par notre équipe. Vous pouvez dès maintenant vous connecter et accéder
             à votre espace.</p>
          <p style="text-align:center">
            <a href="{login_link}"
               style="background:#159c5b;color:#fff;text-decoration:none;
                      padding:12px 24px;border-radius:8px;display:inline-block">
              Me connecter
            </a>
          </p>
          <p style="color:#888;font-size:13px">Bienvenue dans la boucle EcoLoop.</p>
        </div>
        """
        text_content = (
            "Votre compte EcoLoop a été validé. Connectez-vous : " + login_link
        )
        return await self.send_email(to_email, subject, html_content, to_name, text_content)

    async def send_password_reset_email(
        self, to_email: str, token: str, to_name: Optional[str] = None
    ) -> bool:
        """Envoie le lien de réinitialisation du mot de passe."""
        reset_link = f"{settings.frontend_url.rstrip('/')}/reset-password?token={token}"
        subject = "Réinitialisation de votre mot de passe EcoLoop"
        html_content = f"""
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:auto;color:#1a1a1a">
          <h2 style="color:#159c5b">EcoLoop ♻️</h2>
          <p>Bonjour{(' ' + to_name) if to_name else ''},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.
             Cliquez sur le bouton ci-dessous :</p>
          <p style="text-align:center">
            <a href="{reset_link}"
               style="background:#159c5b;color:#fff;text-decoration:none;
                      padding:12px 24px;border-radius:8px;display:inline-block">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p style="color:#888;font-size:13px">Ce lien expire dans 30 minutes.
             Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        </div>
        """
        text_content = f"Réinitialisez votre mot de passe EcoLoop : {reset_link} (valable 30 min)."
        return await self.send_email(to_email, subject, html_content, to_name, text_content)


email_service = EmailService()
