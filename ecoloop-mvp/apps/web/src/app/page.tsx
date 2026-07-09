import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Leaf, Shield, Users, TrendingUp, MapPin, Truck, Factory, Building2, Award } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Producteurs',
    description: 'Déclarez vos déchets, planifiez les collectes et suivez votre impact écologique.',
    href: '/producteur',
    color: 'bg-green-500',
  },
  {
    icon: Truck,
    title: 'Collecteurs',
    description: 'Trouvez des missions près de chez vous, optimisez vos tournées et augmentez vos revenus.',
    href: '/collecteur',
    color: 'bg-blue-500',
  },
  {
    icon: Factory,
    title: 'Industriels',
    description: 'Achetez des matières recyclées de qualité, traçables et certifiées au meilleur prix.',
    href: '/industriel',
    color: 'bg-orange-500',
  },
  {
    icon: Building2,
    title: 'Mairies',
    description: 'Surveillez la propreté de votre territoire, planifiez les collectes et prévenez les saturations.',
    href: '/mairie',
    color: 'bg-purple-500',
  },
];

const stats = [
  { label: 'Tonnes recyclées', value: '12,5K', icon: TrendingUp, color: 'text-green-600' },
  { label: 'Collectes effectuées', value: '8,2K', icon: Truck, color: 'text-blue-600' },
  { label: 'Utilisateurs actifs', value: '3,4K', icon: Users, color: 'text-purple-600' },
  { label: 'CO₂ évité (tonnes)', value: '45K', icon: Leaf, color: 'text-orange-600' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-foreground">EcoLoop</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/producteur" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                Producteur
              </Link>
              <Link href="/collecteur" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                Collecteur
              </Link>
              <Link href="/industriel" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                Industriel
              </Link>
              <Link href="/mairie" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                Mairie
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/connexion">
                <Button variant="ghost" size="sm">Connexion</Button>
              </Link>
              <Link href="/inscription">
                <Button size="sm">S'inscrire</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-950 dark:via-slate-950 dark:to-blue-950" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-8">
              <Leaf className="h-4 w-4" />
              <span>Plateforme d'économie circulaire • MVP Hackathon</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground mb-6">
              Transformez vos déchets
              <br />
              <span className="text-green-600 dark:text-green-400">en ressources</span>
            </h1>
            
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              EcoLoop connecte producteurs, collecteurs et industriels pour une gestion des déchets 
              transparente, traçable et rentable. Rejoignez l'économie circulaire dès aujourd'hui.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/inscription?role=producteur">
                <Button size="lg" className="gap-2 text-lg px-8 py-3" style={{ fontSize: '1.125rem' }}>
                  <Leaf className="h-5 w-5" />
                  Déclarer mes déchets
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/inscription?role=collecteur">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-3" style={{ fontSize: '1.125rem' }}>
                  <Truck className="h-5 w-5" />
                  Devenir collecteur
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-foreground/60">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Traçabilité blockchain</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                <span>Récompenses écologiques</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span>Collecte géolocalisée</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowRight className="h-6 w-6 text-foreground/40 rotate-90" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-background border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-muted">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-foreground/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Une plateforme, quatre acteurs, un objectif commun
            </h2>
            <p className="text-lg text-foreground/70">
              Chaque espace est conçu pour répondre aux besoins spécifiques de votre rôle dans la chaîne de valorisation des déchets.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="h-full transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-between group-hover:gap-2 transition-colors">
                      Découvrir
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Comment ça marche
            </h2>
            <p className="text-lg text-foreground/70">
              Un processus simple en 4 étapes pour transformer vos déchets en valeur
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Déclarer', desc: 'Le producteur photographie et décrit ses déchets via l\'app', icon: '📸' },
              { step: '02', title: 'Collecter', desc: 'Un collecteur proche accepte la mission et récupère les déchets', icon: '🚛' },
              { step: '03', title: 'Peser & Valider', desc: 'Pesée sur place, signature numérique, traçabilité complète', icon: '⚖️' },
              { step: '04', title: 'Valoriser', desc: 'L\'industriel achète le lot, le recycle, tout le monde gagne', icon: '♻️' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="pt-14 text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-foreground/60 text-sm">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="absolute top-5 left-1/2 w-full h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à rejoindre l'économie circulaire ?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Inscrivez-vous gratuitement en 2 minutes et commencez à valoriser vos déchets dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/inscription">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 py-3">
                <Leaf className="h-5 w-5" />
                Créer mon compte
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-3 border-primary-foreground/30 hover:bg-primary-foreground/10">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold">EcoLoop</span>
              </div>
              <p className="text-foreground/60 text-sm">
                La plateforme qui connecte tous les acteurs de l'économie circulaire pour une gestion des déchets plus efficace.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Espaces</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="/producteur" className="hover:text-foreground">Producteur</Link></li>
                <li><Link href="/collecteur" className="hover:text-foreground">Collecteur</Link></li>
                <li><Link href="/industriel" className="hover:text-foreground">Industriel</Link></li>
                <li><Link href="/mairie" className="hover:text-foreground">Mairie</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="/docs" className="hover:text-foreground">Documentation</Link></li>
                <li><Link href="/api-docs" className="hover:text-foreground">API</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/aide" className="hover:text-foreground">Centre d'aide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="/cgu" className="hover:text-foreground">CGU</Link></li>
                <li><Link href="/confidentialite" className="hover:text-foreground">Confidentialité</Link></li>
                <li><Link href="/mentions-legales" className="hover:text-foreground">Mentions légales</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground/50">© 2024 EcoLoop. Tous droits réservés.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-foreground/50 hover:text-foreground transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="#" className="text-foreground/50 hover:text-foreground transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z"/></svg>
              </a>
              <a href="#" className="text-foreground/50 hover:text-foreground transition-colors" aria-label="GitHub">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}