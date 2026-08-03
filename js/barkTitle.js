const barks = [
            "woof woof",
            "arf arf",
            "bark bark",
            "grrrrr,,",
            "wrruufff",
            "if you read this",
            "ur gay"
        ];

let index = 0;

function typeBark(text, onDone) {
    let charIndex = 0;
    const typing = setInterval(() => {
        document.title = text.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === text.length) {
            clearInterval(typing);
            onDone();
        }
    }, 100);
}

function eraseBark(onDone) {
    const erasing = setInterval(() => {
        document.title = document.title.slice(0, -1);
        if (document.title.length === 0) {
            clearInterval(erasing);
            onDone();
        }
    }, 75);
}

function nextBark() {
    const bark = barks[index];
    index = (index + 1) % barks.length;
    typeBark(bark, () => {
        setTimeout(() => {
            eraseBark(nextBark);
        }, 800); 
    });
}

nextBark();