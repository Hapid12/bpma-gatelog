import zipfile
import xml.etree.ElementTree as ET
import sys

def get_docx_text(path):
    try:
        document = zipfile.ZipFile(path)
        xml_content = document.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        paragraphs = []
        for paragraph in tree.findall('.//w:p', namespaces):
            texts = [node.text for node in paragraph.findall('.//w:t', namespaces) if node.text]
            if texts:
                paragraphs.append(''.join(texts))
        return '\n'.join(paragraphs)
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = get_docx_text(sys.argv[1])
        # Write to output file instead of stdout to avoid stdout limit/encoding issues
        with open('docx_output.txt', 'w', encoding='utf-8') as f:
            f.write(text)
        print("Success")
    else:
        print("Provide file path")
