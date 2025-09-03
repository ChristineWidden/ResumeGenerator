# How to set up this project
This project is currently VERY unfriendly to all users who are not me. 
Hopefully, I will improve on that in the future. We will see. 

Anyway here are some instructions on how to run it that will hopefully work for you.

I'm going to try to make these instructions vaguely usable for non-programmers.

## What you need to know and have installed
This project runs on both node js and python, so figure those out and have them ready to go.

If you don't have those, look up how to install them.

If you want to customize how the resume looks at all, you'll also need some HTML and CSS knowledge.

## Setting up the virtual environment

### Making and activating the environment

After downloading the repository, set up a virtual environment in the project root by running the following in the terminal/powershell/whatever. 
Make sure you are in the right folder in the terminal!

```python -m venv myenv``` 

or 

```python3 -m venv myenv``` 

Now activate it. 

On Linux/Mac:

```source myenv/bin/activate```

On Windows:

```myenv\Scripts\activate```

### Installing the project requirements

After activating the venv run:

```pip install -r requirements.txt```

Hopefully that all worked and everything is installed now. 

If you have my luck it probably didn't for some reason. In which case. That sucks.

# How to make a resume with this thing

Locate the file `public/masterlist_data_example.json`. 

This is where you want to put every job, project, skill, whatever you might want to have on a resume.

For now, rename the file to `masterlist_data.json`

Start up the app by running 

```node .\app.js```

It should now say something like ```Server is running on http://localhost:3000``. Navigate to the linked page in your web browser of choice.

If it looks like this things are going great so far:

![image](https://github.com/ChristineWidden/ResumeGenerator/assets/91342711/2478550a-26cd-498d-ad0b-1f3f6019e5ca)

To test that things are ready to go, click at least one option for each checkbox section (pick at least one thing from work_experience, skills, schools, and projects)

Then scroll to the bottom and click "Generate JSON".

If a message pops up saying "JSON generated successfully and PDF generated", it probably worked. Check the project folder for the two output files this app creates:

`output_resume.pdf` and `output_last_page.pdf`

`output_resume.pdf` is what outputs no matter how much content you put in the resume. `output_last_page.pdf` is the same resume, but cut down to only the first page, regardless of what was on the other pages.

If that all worked, you are pretty much ready to go. Add as much information you want about jobs, skills, projects, etc. to the `masterlist_data.json` file. Messing up the formatting will break the program, so 
I recommend using a website like https://jsonchecker.com/ to verify that the formatting is fine or validate it with a programming IDE.

With how the template is set up, you can select up to 8 skills. The result looks best when skills are selected in pairs of 2.

After finishing up the master list, refresh the webpage for the app (make sure to restart it with `node .\app.js` if it crashed at some point), fill out the form with what you want on the resume, and hit the generate button.

Make sure that at least one item is checked for each checkbox section or you will get an error. Additionally, do not select a course for a school/education unless you also select that school/education. 

To leave out the extra section, set both extra_section_name and extra_section_contents to "Other" and leave the text boxes empty.

# How to customize how the resume looks

## Editing the CSS
Editing the CSS is way more straightforward than editing the HTML. The CSS file that affects how the final PDF looks is `output/styles_prod.css`. 

Editing that will allow you to affect the colors, fonts, font size, padding etc. of the final product.

If you want to more easily see how the final product will look without generating a new resume each time, go to the folder ResumeTemplate/ForTestingOnly . In this folder, the files

`ForTestingCSS.html`

and

`preview_styles.css`

can be used to test how the CSS would approximately look on a generated PDF.

To test the styles on a more complete resume of your own, use the app to generate a resume as usual and then move the file `output/rendered_resume.html` into the ForTestingOnly folder.

Edit rendered_resume.html's stylesheet to be `preview_styles.css` and it should be ready to go.

After editing `preview_styles.css` to your liking, delete `output/styles_prod.css` and replace it with a copy of `preview_styles.css`. Rename the copy to `styles_prod.css`.
Then, from the body and .page rules, remove the lines marked by "Remove for prod" and uncomment the lines marked by "Add for prod".

After making these changes, your new CSS sheet should be properly used by the app.

### Editing the HTML templates
Unfortunately, this is not straightforward. If you want to make any complex edits, you may want to familiarize yourself with Jinja2, the templating library that was used:

https://jinja.palletsprojects.com/en/2.10.x/

To make it possible to reorder the sections of the resume, the html templates are handled in a multi-step process that runs in `pdfGenerator.py` after the web app generates a JSON file with the resume contents.

1. The generated JSON file `output/generated_resume_template.json` is read to retrieve the order of the sections on the resume.
2. `ResumeTemplate/child_template.html` is read, which contains the instructions for generating the inner HTML of each section (projects, skills, etc.) based on the template.
3. The block names in `child_template.html` are replaced to correspond with the intended section order.
4. The resulting edited file data is written to `Templates/final_child.html`, where it will extend `Templates/dev2.html` to populate the sections.
5. `final_child.html` is loaded into a template, effectively populating `dev2.html` with its contents.
6. The template is populated with the contents of the resume data and saved to `output/rendered_resume.html`
7. pdfkit generates a pdf from the rendered resume and `styles_prod.css`.

### Adding new sections
The logic for generating the JSON file used to populate the HTML templates is split between `app.js` and the various JS scripts in `public/`. 

Adding a new checkbox section or dropdown section is pretty straightforward. The form is programmatically generated using `public/reference_data.json` to understand the structure.

Fields in `reference_data.json` that are arrays are assumed to be checkbox values, while single values correspond to dropdowns. 

The format of `reference_data.json` should match the format of the `output/generated_resume_template.json` file that will be generated.

Aside from the "schools" and "section_order" fields, which have special rules, pretty much any field can be duplicated as needed. Make sure you edit `masterlist_data.json` to match. Every field in `masterlist_data.json` should be an array.

`child_template.html` and `dev2.html` will also need to be edited to accommodate the new section.


