import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.config.settings import settings

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True,
)


def upload_image(file_path: str, public_id: str | None = None, folder: str = "ecoloop") -> dict:
    upload_result = cloudinary.uploader.upload(
        file_path,
        public_id=public_id,
        folder=folder,
        overwrite=True,
    )
    return {
        "public_id": upload_result["public_id"],
        "secure_url": upload_result["secure_url"],
        "width": upload_result["width"],
        "height": upload_result["height"],
        "format": upload_result["format"],
        "bytes": upload_result["bytes"],
    }


def get_image_info(public_id: str) -> dict:
    result = cloudinary.api.resource(public_id)
    return {
        "public_id": result["public_id"],
        "secure_url": result["secure_url"],
        "width": result["width"],
        "height": result["height"],
        "format": result["format"],
        "bytes": result["bytes"],
    }


def get_transformed_url(public_id: str, **transformations) -> str:
    upload_result = cloudinary.uploader.upload(
        "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
        public_id=public_id,
        folder="ecoloop_test",
    )
    base = upload_result["secure_url"]
    prefix = base.rsplit("/", 1)[0]
    transformed = cloudinary.CloudinaryImage(f"{upload_result['folder']}/{upload_result['public_id']}").build_url(
        **transformations
    )
    return transformed
