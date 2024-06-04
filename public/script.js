document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;

    function updatePreview() {
        document.getElementById('previewName').textContent = document.getElementById('firstname').value + ' ' + document.getElementById('lastname').value;
        document.getElementById('previewCity').textContent = document.getElementById('city').value;
        document.getElementById('previewEmail').textContent = document.getElementById('email').value;
        document.getElementById('previewPhone').textContent = document.getElementById('phone').value;

        updateListPreview('.education-entry', '.qualification', '.area', '.score', 'previewEducationList');
        updateListPreview('.work-entry', '.job-title', '.company', '.duration', 'previewWorkList');
        updateListPreview('.skill-entry', '.skill', '', '', 'previewSkillList');
    }

    function updateListPreview(entrySelector, firstFieldSelector, secondFieldSelector, thirdFieldSelector, previewListId) {
        const previewList = document.getElementById(previewListId);
        previewList.innerHTML = "";
        const entries = document.querySelectorAll(entrySelector);
        entries.forEach(function(entry) {
            const firstField = entry.querySelector(firstFieldSelector).value;
            const secondField = secondFieldSelector ? ' - ' + entry.querySelector(secondFieldSelector).value : '';
            const thirdField = thirdFieldSelector ? ' - ' + entry.querySelector(thirdFieldSelector).value : '';
            const label = document.createElement('label');
            label.textContent = firstField + secondField + thirdField;
            previewList.appendChild(label);
            previewList.appendChild(document.createElement('br'));
        });
    }

    function addEntry(containerSelector, entrySelector) {
        const container = document.querySelector(containerSelector);
        const newEntry = document.querySelector(entrySelector).cloneNode(true);
        newEntry.querySelectorAll('input').forEach(input => {
            input.value = '';
            input.addEventListener('input', updatePreview);
        });
        container.appendChild(newEntry);
    }

    document.getElementById('addEducation').addEventListener('click', function() {
        addEntry('.education', '.education-entry');
    });

    document.getElementById('addWork').addEventListener('click', function() {
        addEntry('.work-experience', '.work-entry');
    });

    document.getElementById('addSkill').addEventListener('click', function() {
        addEntry('.skills', '.skill-entry');
    });

    document.getElementById('resumeForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const resumeData = {
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            city: formData.get('city'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            education: [],
            workExperience: [],
            skills: []
        };

        document.querySelectorAll('.education-entry').forEach(entry => {
            resumeData.education.push({
                qualification: entry.querySelector('.qualification').value,
                area: entry.querySelector('.area').value,
                score: entry.querySelector('.score').value
            });
        });

        document.querySelectorAll('.work-entry').forEach(entry => {
            resumeData.workExperience.push({
                jobTitle: entry.querySelector('.job-title').value,
                company: entry.querySelector('.company').value,
                duration: entry.querySelector('.duration').value
            });
        });

        document.querySelectorAll('.skill-entry').forEach(entry => {
            resumeData.skills.push({
                skill: entry.querySelector('.skill').value
            });
        });

        fetch('/resumes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resumeData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Resume saved successfully') {
                alert('Resume saved successfully');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        const previewContainer = document.getElementById('resumePreview');
        
        html2canvas(previewContainer).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'PNG', 0, 0);
            pdf.save('resume.pdf');
        });
    });

    document.getElementById('templateSelector').addEventListener('change', updateTemplate);

    function updateTemplate() {
        const selectedTemplate = document.getElementById('templateSelector').value;
        const previewContainer = document.getElementById('resumePreview');
        previewContainer.className = `preview-container ${selectedTemplate}`;
    }

    document.querySelectorAll('input').forEach(input => input.addEventListener('input', updatePreview));
    updatePreview();
    updateTemplate();
});
