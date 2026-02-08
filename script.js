const container = document.getElementById('steps-container');
const searchInput = document.getElementById('procedure-search');
const clearBtn = document.getElementById('clear-search');

const infoIconSvg = `<svg class="info-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;

function renderSteps(steps, level = 1) {
    if (!steps) return '';
    return steps.map(step => {
        const hasContent = (step.children && step.children.length > 0) || (step.items && step.items.length > 0);

        return `
            <div class="${level === 1 ? 'step-item' : 'nested-accordion'}" data-level="${level}">
                <button class="${level === 1 ? 'step-trigger' : 'nested-trigger'} ${!hasContent ? 'no-click' : ''}">
                    ${step.number ? `<span class="step-number">${step.number}</span>` : ''}
                    
                    <div class="trigger-text-container">
                        <div class="Text searchable">${step.title}</div>
                        ${step.details ? `
                            <div class="info-wrapper">
                                ${infoIconSvg}
                                <div class="subText searchable">${step.details}</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${hasContent ? `<span class="chevron">▼</span>` : ''}
                </button>
                
                ${hasContent ? `
                <div class="step-content-wrapper">
                    <div class="${level === 1 ? 'step-content' : 'nested-content'}">
                        ${step.items ? `<ul>${step.items.map(i => {
                            const txt = typeof i === 'string' ? i : i.text;
                            const sub = i.sub ? `
                                <div class="info-wrapper" style="margin-top:4px;">
                                    ${infoIconSvg}
                                    <span class="subText searchable">${i.sub}</span>
                                </div>` : '';
                            return `<li><span class="Text searchable">${txt}</span>${sub}</li>`;
                        }).join('')}</ul>` : ''}
                        ${renderSteps(step.children, level + 1)}
                    </div>
                </div>` : ''}
            </div>
        `;
    }).join('');
}

function applyHighlight(searchTerm) {
    const targets = document.querySelectorAll('.searchable');
    targets.forEach(el => {
        if (!el.hasAttribute('data-original')) el.setAttribute('data-original', el.innerText);
        const originalText = el.getAttribute('data-original');
        if (!searchTerm) { el.innerHTML = originalText; return; }
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        el.innerHTML = originalText.replace(regex, `<span class="highlight">$1</span>`);
    });
}

function resetSearch() {
    searchInput.value = "";
    clearBtn.style.display = "none";
    applyHighlight("");
    document.querySelectorAll('.step-item, .nested-accordion').forEach(item => {
        item.style.display = "block";
        item.classList.remove('active');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    container.innerHTML = renderSteps(procedureData);

    // Toggle logic with check for "no-click"
    container.addEventListener('click', (e) => {
        const trigger = e.target.closest('.step-trigger, .nested-trigger');
        if (trigger && !trigger.classList.contains('no-click')) {
            e.stopPropagation();
            trigger.parentElement.classList.toggle('active');
        }
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const allItems = document.querySelectorAll('.step-item, .nested-accordion');
        clearBtn.style.display = term.length > 0 ? "block" : "none";
        applyHighlight(term);

        allItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (term === "") {
                item.style.display = "block";
                item.classList.remove('active');
            } else if (text.includes(term)) {
                item.style.display = "block";
                let current = item;
                while (current) {
                    current.classList.add('active');
                    current = current.parentElement.closest('.step-item, .nested-accordion');
                }
            } else {
                item.style.display = "none";
            }
        });
    });

    clearBtn.addEventListener('click', resetSearch);

    document.getElementById('expand-all').addEventListener('click', () => {
        document.querySelectorAll('.step-item, .nested-accordion:not(.is-leaf)').forEach(el => {
            const trigger = el.querySelector('.step-trigger, .nested-trigger');
            if(trigger && !trigger.classList.contains('no-click')) el.classList.add('active');
        });
    });

    document.getElementById('collapse-all').addEventListener('click', () => {
        document.querySelectorAll('.step-item, .nested-accordion').forEach(el => el.classList.remove('active'));
    });
});

// const modal = document.getElementById('data-modal');
// const modalSearch = document.getElementById('modal-search');
// let currentTableRows = []; // Store active rows for searching
// const clearBtntBL = document.getElementById('clear-searchTbl');
// // Open Modal function
// function openModal(tableId) {
//     const data = modalData[tableId];
//     if (!data) return;

//     document.getElementById('modal-title').innerText = data.title;
    
//     // Build Headers
//     const head = document.getElementById('table-head');
//     head.innerHTML = data.headers.map(h => `<th>${h}</th>`).join('');

//     // Store rows for search and render
//     currentTableRows = data.rows;
//     renderTableRows(currentTableRows);

//     modal.style.display = 'block';
// }

// function renderTableRows(rows) {
//     const body = document.getElementById('table-body');
//     body.innerHTML = rows.map(row => 
//         `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
//     ).join('');
// }

// // Modal Search Logic
// modalSearch.addEventListener('input', (e) => {
//     const term = e.target.value.toLowerCase();
//      clearBtntBL.style.display = term.length > 0 ? "block" : "none";
//     const filtered = currentTableRows.filter(row => 
//         row.some(cell => cell.toLowerCase().includes(term))
//     );
//     renderTableRows(filtered);
// });

//     clearBtntBL.addEventListener('click', clearSearch);
// // Event Delegation for links inside accordion
// container.addEventListener('click', (e) => {
//     if (e.target.classList.contains('modal-link')) {
//         const tableId = e.target.getAttribute('data-table');
//         openModal(tableId);
//     }
// });
// function clearSearch() {
//     modalSearch.value = "";
//     clearBtntBL.style.display = "none";
// }
// // Close Modal
// document.getElementById('close-modal').onclick = () => modal.style.display = 'none';
// window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };
const modal = document.getElementById('data-modal');
const modalSearch = document.getElementById('modal-search');
const clearBtntBL = document.getElementById('clear-searchTbl');
let currentTableRows = []; 

// Open Modal function
function openModal(tableId) {
    const data = modalData[tableId];
    if (!data) return;

    document.getElementById('modal-title').innerText = data.title;
    
    // Build Headers
    const head = document.getElementById('table-head');
    head.innerHTML = data.headers.map(h => `<th>${h}</th>`).join('');

    // Store rows for search and render
    currentTableRows = data.rows;
    renderTableRows(currentTableRows);

    // Reset search state when opening
    modalSearch.value = "";
    clearBtntBL.style.display = "none";
    
    modal.style.display = 'block';
}

function renderTableRows(rows) {
    const body = document.getElementById('table-body');
    body.innerHTML = rows.map(row => 
        `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
    ).join('');
}

// Modal Search Logic
modalSearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    clearBtntBL.style.display = term.length > 0 ? "block" : "none";
    
    const filtered = currentTableRows.filter(row => 
        row.some(cell => cell.toString().toLowerCase().includes(term))
    );
    renderTableRows(filtered);
});

// THE FIX: Re-render the original rows after clearing the input
function clearSearch() {
    modalSearch.value = "";
    clearBtntBL.style.display = "none";
    renderTableRows(currentTableRows); // Restores all data to the table
    modalSearch.focus();
}

clearBtntBL.addEventListener('click', clearSearch);

// Event Delegation for links inside accordion
container.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-link')) {
        const tableId = e.target.getAttribute('data-table');
        openModal(tableId);
    }
});

// Close Modal
document.getElementById('close-modal').onclick = () => modal.style.display = 'none';