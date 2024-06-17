document.getElementById('upload-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData();
    
    const fileVar = document.getElementById('file-upload').files[0];
    formData.append('file', fileVar);
    
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    if (result.filePath) {
        const link = document.createElement('a');
        link.href = result.filePath;
        link.innerText = 'Download PDF';
        link.classList.add('custom-file-upload'); 
        link.setAttribute('download', 'converted.pdf');
        document.getElementById('result').innerHTML = '';
        document.getElementById('result').appendChild(link);
    } else if (result.error) {
        document.getElementById('result').innerHTML = `<p style="color: red;">${result.error}</p>`;
    }
});
