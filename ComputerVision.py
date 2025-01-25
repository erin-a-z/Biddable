import boto3
from PIL import Image, ImageDraw

# AWS Rekognition client setup
rekognition = boto3.client("rekognition", region_name="us-east-1")  # Replace 'us-east-1' with your region


def detect_objects(image_path):
    """
    Detect objects in an image using AWS Rekognition.

    :param image_path: Path to the image file
    :return: List of detected objects
    """
    with open(image_path, "rb") as image_file:
        image_bytes = image_file.read()

    # Rekognition API call for object detection
    response = rekognition.detect_labels(
        Image={"Bytes": image_bytes},
        MaxLabels=10,  # Adjust as needed
        MinConfidence=50  # Minimum confidence level
    )

    if "Labels" in response:
        return response["Labels"]
    else:
        print("No objects detected.")
        return []


def visualize_objects(image_path, detected_objects):
    """
    Visualize detected objects on the image by drawing bounding boxes.

    :param image_path: Path to the image file
    :param detected_objects: List of detected objects
    """
    image = Image.open(image_path)
    draw = ImageDraw.Draw(image)

    for obj in detected_objects:
        if "Instances" in obj:
            for instance in obj["Instances"]:
                box = instance["BoundingBox"]
                left = box["Left"] * image.width
                top = box["Top"] * image.height
                width = box["Width"] * image.width
                height = box["Height"] * image.height

                # Draw bounding box
                draw.rectangle([left, top, left + width, top + height], outline="red", width=3)
                # Add label
                draw.text((left, top), obj["Name"], fill="red")

    # Save the output image
    output_path = "output_image.jpg"
    image.save(output_path)
    print(f"Output image saved as {output_path}")


def main():
    image_path = "pizza.jpg"  # Replace with your image file path

    print("Detecting objects...")
    detected_objects = detect_objects(image_path)

    if detected_objects:
        print("Detected objects:")
        for obj in detected_objects:
            print(f"Name: {obj['Name']}, Confidence: {obj['Confidence']:.2f}%")

        visualize_objects(image_path, detected_objects)
    else:
        print("No objects detected.")


if __name__ == "__main__":
    main()
