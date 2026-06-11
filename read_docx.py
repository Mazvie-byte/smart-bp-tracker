import docx

def extract_text(filename):
    try:
        doc = docx.Document(filename)
        fullText = []
        for para in doc.paragraphs:
            if para.text.strip():
                fullText.append(para.text)
        
        with open("docx_content.txt", "w", encoding="utf-8") as f:
            f.write("\n\n".join(fullText))
            
        print("Successfully extracted text to docx_content.txt")
    except Exception as e:
        print(f"Error reading file: {e}")

if __name__ == "__main__":
    extract_text("Mazvita Ziwira Final year project NEW .docx")
