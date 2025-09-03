
const RESULTS_LIMIT = 15
const GAME_WORD_BOOST = 3;
const TECH_WORD_BOOST = 2;

let commonWords = new Set();
let techTerms = new Set();
let gameDevTerms = new Set();

async function loadWordList(path, limit = Infinity) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    const text = await res.text();
    const words = text.toLowerCase().split(/\r?\n/).map(w => w.trim()).filter(Boolean);
    return new Set(words.slice(0, limit));
}

async function loadAllWordLists() {
    [commonWords, techTerms, gameDevTerms] = await Promise.all([
        loadWordList("../data/english20k.txt", 1500),
        loadWordList("../data/techWords.txt"),
        loadWordList("../data/gameWords.txt")
    ]);
}

function levenshtein(a, b) {
    const matrix = [];
    const lenA = a.length, lenB = b.length;

    for (let i = 0; i <= lenB; i++) matrix[i] = [i];
    for (let j = 0; j <= lenA; j++) matrix[0][j] = j;

    for (let i = 1; i <= lenB; i++) {
        for (let j = 1; j <= lenA; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[lenB][lenA];
}

function fuzzyMatchScore(text, keywords, maxDistance = 2) {
    const lowerText = text.toLowerCase();
    let score = 0;
    for (const keyword of keywords) {
        const regex = new RegExp(`\\b\\w+\\b`, 'g');
        const words = lowerText.match(regex) || [];
        for (const word of words) {
            const distance = levenshtein(keyword, word);
            if (distance <= maxDistance) {
                score += 1 - distance / keyword.length; // Higher score for closer matches
            }
        }
    }
    return score;
}

function matchScoreExact(text, keywords) {
    const lower = text.toLowerCase();
    return keywords.reduce((score, word) => lower.includes(word) ? score + 1 : score, 0);
}

function combinedMatchScore(text, keywords) {
    const exactScore = matchScoreExact(text, keywords);
    const fuzzyScore = fuzzyMatchScore(text, keywords);
    return exactScore + fuzzyScore;
}

function highlightMatches(text, keywords) {
    let result = text;
    keywords.forEach(keyword => {
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape special characters
        const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');
        result = result.replace(regex, '<b>$1</b>');
    });
    return result;
}

function tokenize(text) {
    const whitelist = new Set([...techTerms, ...gameDevTerms]);
    return text
        .toLowerCase()
        .match(/\b[\w#.+-]+\b/g)
        ?.filter(word =>
            whitelist.has(word) || !commonWords.has(word)
        ) || [];
}

function extractKeywords(text) {
    text = text.toLowerCase();
    const tokens = tokenize(text);
    const freq = {};
    for (const token of tokens) {
        let techBoost = techTerms.has(token) ? TECH_WORD_BOOST : 1;  // 👈 Boost tech terms
        let gameBoost = gameDevTerms.has(token) ? GAME_WORD_BOOST : 1;  // 👈 Boost tech terms
        freq[token] = (freq[token] || 0) + techBoost + gameBoost;
    }
    return Object.keys(freq)
        .sort((a, b) => freq[b] - freq[a])
        .slice(0, 300);
}



function renderMatches(title, items, keywords, renderItem) {
    const container = document.createElement("div");
    container.classList.add("section");
    const heading = document.createElement("h2");
    heading.textContent = title;
    container.appendChild(heading);

    const scoredItems = items
        .map(item => ({ item, score: combinedMatchScore(renderItem(item), keywords) }))
        .filter(entry => entry.score > 0)
        .sort((a, b) => b.score - a.score);

    if (scoredItems.length === 0) {
        container.innerHTML += "<p><i>No strong matches found.</i></p>";
        return container;
    }

    const topMatches = scoredItems
        .filter(i => i.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, RESULTS_LIMIT); // or however many you want

    if (topMatches.length === 0) return '';

    for (const { item, score } of topMatches) {
        const div = document.createElement("div");
        div.className = "match";
        const renderedItem = highlightMatches(renderItem(item), keywords)
        div.innerHTML = `<strong>Match Score:</strong> ${score}<br>${renderedItem}`;
        container.appendChild(div);
    }

    return container;
}

async function fetchMasterlist() {
    const res = await fetch("../data/masterlist_data.json");
    if (!res.ok) throw new Error("Failed to load masterlist");
    return await res.json();
}

document.getElementById("analyze-btn").addEventListener("click", async () => {
    if (commonWords.size === 0) await loadAllWordLists();  // Lazy load once

    const desc = document.getElementById("job-desc").value.trim();
    if (!desc) return alert("Please paste a job description.");

    const keywords = extractKeywords(desc);
    console.log("Extracted keywords:", keywords);
    const masterlist = await fetchMasterlist();

    const recommendations = document.getElementById("recommendations");
    recommendations.innerHTML = "";

    recommendations.appendChild(
        renderMatches("🔧 Skills", masterlist.skills, keywords, skill => skill)
    );

    recommendations.appendChild(
        renderMatches("💼 Work Experience", masterlist.work_experience, keywords, exp =>
            `<u>${exp.title}</u> at ${exp.company}<br>${(exp.description || []).join(" ")}`
        )
    );

    for (const i in masterlist.schools) {
        let school = masterlist.schools[i]
        console.log(school)
        recommendations.appendChild(
            renderMatches("🎓 Education: " + school.degree, school.courses, keywords, course =>
                `<u>${course.name || ""}</u><br>${course.description || ""}`
            )
        );
    }

    recommendations.appendChild(
        renderMatches("📁 Projects", masterlist.projects, keywords, project =>
            `<u>${project.name}</u><br>${(project.desc || []).join(" ")}`
        )
    );
});
