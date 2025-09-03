import re
import requests
import sys

def doc_id_from_url(url: str) -> str:
    match = re.search(r"/document/d/([a-zA-Z0-9-_]+)", url)
    if not match:
        raise ValueError("Invalid Google Docs URL")

    doc_id = match.group(1)
    return doc_id


def get_google_doc_text_from_url(url: str) -> str:
    # Export URL for plain text
    export_url = f"https://docs.google.com/document/d/{doc_id}/export?format=txt"

    response = requests.get(export_url)
    if response.status_code == 200:
        return response.text
    else:
        raise Exception(f"Failed to retrieve document. Status code: {response.status_code}")

# Example usage:
if __name__ == "__main__":
    # url = "https://docs.google.com/document/d/e/2PACX-1vTMOmshQe8YvaRXi6gEPKKlsC6UpFJSMAk4mQjLm_u1gmHdVVTaeh7nBNFBRlui0sTZ-snGwZM4DBCT/pub"
    url = sys.argv[1]
    text = get_google_doc_text_from_url(url)
    print(text)
