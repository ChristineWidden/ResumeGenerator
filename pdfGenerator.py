import json
from jinja2 import Environment, FileSystemLoader
import pdfkit

# Load your personal information and resume template
with open('output/generated_resume_template.json', 'r') as f:
    resume_data = json.load(f)

env = Environment(loader=FileSystemLoader('.'))
template = env.get_template('dev2.html')

# Render the template with your data
rendered_resume = template.render(resume_data)

# Save the rendered resume as an HTML file
with open('output/rendered_resume.html', 'w') as f:
    f.write(rendered_resume)

# Define PDF options with custom margin settings
pdf_options = {
    'margin-top': '0.5in',
    'margin-right': '0.0in',
    'margin-bottom': '0.0in',
    'margin-left': '0.0in',
    "enable-local-file-access": ""
}

# Generate PDF from the HTML file
pdfkit.from_file('output/rendered_resume.html', 'output_resume.pdf', options=pdf_options, configuration=pdfkit.configuration(wkhtmltopdf='D:\Program Files\wkhtmltopdf\\bin\wkhtmltopdf.exe'))
