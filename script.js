// Dein Are.na Channel-Slug:
const ARENA_CHANNEL_SLUG = "blog-stvpsg6449s";

const feedContainer = document.getElementById("feedContainer");
const dateNav = document.getElementById("dateNav");

// Filtert automatische Kamera-/iPhone-Dateinamen heraus
function getCleanCaption(block) {
    if (block.description && block.description.trim() !== "") {
        return block.description.trim();
    }
    if (block.title && block.title.trim() !== "") {
        const title = block.title.trim();
        const isAutoFilename =
            /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp|tiff|mov|mp4)$/i.test(title) ||
            /^(IMG|DSC|PXL|APC|MVI|SAM|DJI|GOPR|Screenshot|Bildschirmfoto|Photo|Image|WhatsApp|FullSizeRender|Untitled)/i.test(title) ||
            /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(title) ||
            /^[0-9a-f]{24,}$/i.test(title) ||
            /^\d{6,}[_-]\d+/i.test(title);
        if (!isAutoFilename) {
            return title;
        }
    }
    return "";
}

async function loadArenaFeed() {
    try {
        const response = await fetch(`https://api.are.na/v2/channels/${ARENA_CHANNEL_SLUG}/contents?per=100&t=${Date.now()}`);
        if (!response.ok) {
            throw new Error("Channel konnte nicht geladen werden.");
        }
        const data = await response.json();
        const blocks = data.contents || [];

        // Sortiert alle Einträge automatisch so, dass der neueste immer ganz oben steht
        blocks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        let lastDateString = "";

        blocks.forEach((block, index) => {
            if (block.class !== "Image" && block.class !== "Text") return;

            const itemDiv = document.createElement("div");
            itemDiv.className = "entry";

            // 1. Automatische Tagesnavigation (z. B. "19 10 26") links erzeugen
            if (block.created_at) {
                const dateObj = new Date(block.created_at);
                const day = String(dateObj.getDate()).padStart(2, "0");
                const month = String(dateObj.getMonth() + 1).padStart(2, "0");
                const year = String(dateObj.getFullYear()).slice(-2);

                const fullDate = `${day} ${month} ${year}`;

                if (fullDate !== lastDateString) {
                    lastDateString = fullDate;
                    const anchorId = "date-" + index;
                    itemDiv.id = anchorId;

                    const navLink = document.createElement("a");
                    navLink.href = "#" + anchorId;
                    navLink.textContent = fullDate;
                    dateNav.appendChild(navLink);
                }
            }

            // 2. Fall A: Bild-Post
            if (block.class === "Image" && block.image) {
                const img = document.createElement("img");
                img.src = block.image.display.url;
                img.loading = "lazy";
                img.addEventListener("load", () => img.classList.add("loaded"));
                itemDiv.appendChild(img);

                const captionText = getCleanCaption(block);
                if (captionText) {
                    const caption = document.createElement("p");
                    caption.className = "caption";
                    caption.textContent = captionText;
                    itemDiv.appendChild(caption);
                }

                feedContainer.appendChild(itemDiv);
            }

            // 3. Fall B: Reiner Text-Post zwischen den Bildern
            else if (block.class === "Text" && block.content) {
                const textP = document.createElement("p");
                textP.className = "text-entry";
                textP.innerHTML = block.content.replace(/\n/g, "<br>");
                itemDiv.appendChild(textP);

                feedContainer.appendChild(itemDiv);
            }
        });
    } catch (error) {
        console.error("Fehler beim Laden des Are.na-Feeds:", error);
    }
}

loadArenaFeed();

// --- REISE-TIMER OBEN RECHTS ---
const TRIP_START = new Date("2026-10-19T09:35:00+02:00");

function updateTripTimer() {
    const timerEl = document.getElementById("tripTimer");
    if (!timerEl) return;

    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((now - TRIP_START) / 1000));

    const days = Math.floor(diffSeconds / 86400);
    const hours = String(Math.floor((diffSeconds % 86400) / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((diffSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(diffSeconds % 60).padStart(2, "0");

    timerEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateTripTimer, 1000);
updateTripTimer();
