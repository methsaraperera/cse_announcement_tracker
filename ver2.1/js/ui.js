import { capitalizeFirstLetter } from './utils.js';

export function populateStockDropdown(stocks) {
    const stockDropdown = document.getElementById('stockDropdown');
    stocks.forEach(stock => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.value = stock.securityId;
        checkbox.id = stock.symbol;
        checkbox.classList.add('stock-checkbox');
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(`${stock.name} (${stock.symbol})`));
        stockDropdown.appendChild(label);
        stockDropdown.appendChild(document.createElement('br'));
    });
}

export function populateCategoryDropdown(categories) {
    const categoryDropdown = document.getElementById('categoryDropdown');
    categories.forEach(category => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.value = category.categoryName;
        checkbox.id = category.id;
        checkbox.classList.add('category-checkbox');
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(category.categoryName));
        categoryDropdown.appendChild(label);
        categoryDropdown.appendChild(document.createElement('br'));
    });
}

export function renderAnnouncements(announcements) {
    const announcementsDiv = document.getElementById('announcements');
    
    if (announcements.length === 0) {
        announcementsDiv.innerHTML = "<p class='p-4 text-gray-500'>No announcements found.</p>";
        return;
    }

    announcementsDiv.innerHTML = announcements.map(announcement => `
        <button class="w-full text-left p-2 bg-green-100 hover:bg-green-200 rounded-md transition-colors mb-2 announcement-btn" 
                data-announcement-id="${announcement.announcementId}">
            <div class="font-semibold">${announcement.announcementCategory}</div>
            <div>${announcement.company}</div>
            <div class="text-sm text-gray-600">${announcement.dateOfAnnouncement || 'N/A'}</div>
        </button>
    `).join('');
}

export function renderAnnouncementDetails(announcement, docs) {
    const announcementDetailsDiv = document.getElementById('announcementDetails');
    
    if (!announcement) {
        announcementDetailsDiv.innerHTML = "<p class='text-red-500'>No details available.</p>";
        return;
    }

    let detailsHtml = `
        <h2 class="text-2xl font-bold mb-4">${announcement.title || 'Announcement Details'}</h2>
        <div class="prose">
    `;

    Object.keys(announcement).forEach(key => {
        if (announcement[key] != null && key !== 'title') {
            detailsHtml += `
                <p>
                    <strong>${capitalizeFirstLetter(key.replace(/([A-Z])/g, ' $1'))}:</strong> 
                    ${announcement[key]}
                </p>
            `;
        }
    });

    if (docs && docs.length > 0) {
        detailsHtml += '<h3 class="mt-4">Documents:</h3><ul>';
        docs.forEach(doc => {
            detailsHtml += `
                <li>
                    <a href="https://cdn.cse.lk/${doc.fileUrl}" 
                       target="_blank" 
                       class="text-blue-600 hover:underline">
                        ${doc.fileOriginalName} (PDF)
                    </a>
                </li>
            `;
        });
        detailsHtml += '</ul>';
    }

    detailsHtml += '</div>';
    announcementDetailsDiv.innerHTML = detailsHtml;
}