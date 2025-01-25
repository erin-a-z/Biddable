import boto3
from PIL import Image, ImageDraw
import requests

# AWS Rekognition client setup
rekognition = boto3.client("rekognition", region_name="us-east-1")

# SERP API Key (replace with your key)
SERP_API_KEY = "81b3c1d633e6a2148865a28c9538c83fa6f6086b908b29023bc598ceb3b436c1"


def detect_objects(image_path):
    """
    Detect objects in an image using AWS Rekognition.
    :param image_path: Path to the image file
    :return: List of detected objects excluding food
    """
    with open(image_path, "rb") as image_file:
        image_bytes = image_file.read()

    # Rekognition API call
    response = rekognition.detect_labels(
        Image={"Bytes": image_bytes},
        MaxLabels=10,  # Number of labels to detect
        MinConfidence=50  # Minimum confidence threshold
    )

    if "Labels" in response:
        # Exclude food-related objects
        return [label for label in response["Labels"] if "Food" not in label["Name"]]
    else:
        print("No objects detected.")
        return []


def search_price_with_serp_api(object_name):
    """
    Use SERP API to search for a single product price, excluding irrelevant results.
    :param object_name: The name of the detected object
    :return: First reasonable price found or "Unknown" if no price is available
    """
    print(f"Searching for prices of '{object_name}'...")
    api_url = "https://serpapi.com/search"
    params = {
        "engine": "google",
        "q": f"{object_name} regular pizza affordable",  # Refined query
        "tbm": "shop",  # Shopping search
        "api_key": SERP_API_KEY
    }

    response = requests.get(api_url, params=params)

    if response.status_code == 200:
        results = response.json()

        # Extract all shopping results
        shopping_results = results.get("shopping_results", [])
        if shopping_results:
            # Print all results for debugging
            print("Shopping Results:", shopping_results)

            # Filter and return the most reasonable price
            prices = []
            for result in shopping_results:
                price = result.get("price", "Unknown")
                if price != "Unknown" and price.startswith("$"):
                    try:
                        numeric_price = float(price.replace("$", "").replace(",", ""))
                        if 5 <= numeric_price <= 50:  # Reasonable price range
                            prices.append((result["title"], numeric_price))
                    except ValueError:
                        continue

            if prices:
                print("Filtered Prices:", prices)
                return f"${min(prices, key=lambda x: x[1])[1]:.2f}"

        print("No relevant prices found in the results.")
        return "Unknown"
    else:
        print(f"SERP API Error: {response.status_code}, {response.text}")
        return "Unknown"


def visualize_objects(image_path, top_object, obj_price):
    """
    Visualize the top detected object on the image and display its price.
    :param image_path: Path to the image file
    :param top_object: Top detected object
    :param obj_price: Price of the object
    """
    image = Image.open(image_path)
    draw = ImageDraw.Draw(image)

    if "Instances" in top_object:
        obj_name = top_object["Name"]
        confidence = top_object["Confidence"]

        for instance in top_object["Instances"]:
            box = instance["BoundingBox"]
            left = box["Left"] * image.width
            top = box["Top"] * image.height
            width = box["Width"] * image.width
            height = box["Height"] * image.height

            # Draw rectangle and add label
            draw.rectangle([left, top, left + width, top + height], outline="red", width=3)
            label = f"{obj_name} - {obj_price} ({confidence:.2f}%)"
            draw.text((left, top), label, fill="red")

    # Save annotated image
    output_path = "output_image.jpg"
    image.save(output_path)
    print(f"Annotated image saved as {output_path}")


def main():
    image_path = "pizza.jpg"  # Replace with your image path

    print("Detecting objects with AWS Rekognition...")
    detected_objects = detect_objects(image_path)

    if detected_objects:
        # Find the object with the highest confidence
        top_object = max(detected_objects, key=lambda obj: obj["Confidence"])
        obj_name = top_object["Name"]
        confidence = top_object["Confidence"]
        print(f"Top Detected Object: {obj_name} (Confidence: {confidence:.2f}%)")

        # Fetch price using SERP API for the top object
        obj_price = search_price_with_serp_api(obj_name)

        # Visualize the top detected object with price
        visualize_objects(image_path, top_object, obj_price)
    else:
        print("No objects detected.")


if __name__ == "__main__":
    main()
