import json
from jinja2 import Environment, FileSystemLoader
import pdfkit
import PyPDF2
import os



with open('output/generated_resume_template.json', 'r') as f:
    resume_data = json.load(f)
block_order = resume_data["section_order"]
print(block_order)



# Load your personal information and resume template
template_directory = 'ResumeTemplate/Templates'
template_file = 'dev2.html'
child_template_file = 'child_template.html'
child_template_file_final = 'final_child.html'

with open(os.path.join(f'ResumeTemplate/{child_template_file}'), 'r') as file:
    child_template_content = file.read()

for i, block in enumerate(block_order):
    child_template_content = child_template_content.replace(f'{block}_replace', f'section{i}')
child_template_content = child_template_content.replace(f'replace_main.html', template_file)

with open(template_directory + f"/{child_template_file_final}", 'w') as file:
    file.write(child_template_content)

env = Environment(loader=FileSystemLoader(template_directory))
template = env.get_template(child_template_file_final)


# Render the template with your data
rendered_resume = template.render(resume_data)

# Save the rendered resume as an HTML file
with open('output/rendered_resume.html', 'w') as f:
    f.write(rendered_resume)

# Define PDF options with custom margin settings
pdf_options = {
    'margin-top': '0.1in',
    'margin-right': '0.0in',
    'margin-bottom': '0.0in',
    'margin-left': '0.0in',
    "enable-local-file-access": ""
}

# Generate PDF from the HTML file
out_file = 'output_resume.pdf'
pdfkit.from_file('output/rendered_resume.html', out_file, options=pdf_options, configuration=pdfkit.configuration(wkhtmltopdf='D:\Program Files\wkhtmltopdf\\bin\wkhtmltopdf.exe'))

with open(out_file, 'rb') as pdf_file:
    # Create a PdfFileReader object
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    
    # Create a PdfFileWriter object
    pdf_writer = PyPDF2.PdfWriter()
    
    # Add the last page to the PdfFileWriter object
    pdf_writer.add_page(pdf_reader.pages[0])
    
    # Write the PdfFileWriter object to a new PDF file
    with open('output_last_page.pdf', 'wb') as output_file:
        pdf_writer.write(output_file)