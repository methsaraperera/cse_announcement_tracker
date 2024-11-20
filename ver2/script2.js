document.addEventListener("DOMContentLoaded", () => {
    const stockDropdown = document.getElementById('stockDropdown');
    const stockDropdownBtn = document.getElementById('stockDropdownBtn');
    const announcementTypeSelectDropdown = document.getElementById('announcementTypeSelect');
    const announcementTypeSelectDropdownBtn = document.getElementById('announcementTypeSelectBtn');
    const announcementsDiv = document.getElementById('announcements');
    const announcementDetailsDiv = document.getElementById('announcementDetails');
    const templateButtons = document.querySelectorAll('.template-btn');
    const dropdownButton = document.querySelector('.dropdown-btn');

    const apiUrl = "https://www.cse.lk/api/cntSecurity";
    const noticeApiUrl = "https://www.cse.lk/api/approvedAnnouncement";
    const announcementDetailUrl = "https://www.cse.lk/api/getGeneralAnnouncementById";
    const fallbackAnnouncementDetailUrl = "https://www.cse.lk/api/getAnnouncementById";
    const announcementCategoryApiUrl = "https://www.cse.lk/api/corporateAnnouncementCategory";
    

    // Fetch stocks and populate the dropdown
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const stocks = data.content;
            stocks.forEach(stock => {
                // Create checkbox and label for each stock
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = "checkbox";
                checkbox.value = stock.securityId;
                checkbox.id = stock.symbol;
                checkbox.classList.add('stock-checkbox');
                
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(`${stock.name} (${stock.symbol})`));
                stockDropdown.appendChild(label);
                stockDropdown.appendChild(document.createElement('br'));  // Add line break between checkboxes
            });
        })
        .catch(error => console.error("Error fetching stocks:", error));

    // Toggle the dropdown visibility
    stockDropdownBtn.addEventListener('click', (event) => {
        const isHidden = stockDropdown.classList.contains('hidden');
        stockDropdown.classList.toggle('hidden', !isHidden); // Toggle hidden class
        event.stopPropagation();  // Prevent event from propagating
    });

    // Close dropdown if clicking outside
    document.addEventListener('click', (event) => {
        if (!stockDropdown.contains(event.target) && !stockDropdownBtn.contains(event.target)) {
            stockDropdown.classList.add('hidden');  // Hide the dropdown if clicking outside
        }
    });

    // Handle checkbox changes (multiple selection logic)
    stockDropdown.addEventListener('change', () => {
        const selectedStocks = [];
        document.querySelectorAll('.stock-checkbox:checked').forEach(checkbox => {
            selectedStocks.push(checkbox.value);
        });
        console.log("Selected Stocks:", selectedStocks);
        // You can now handle selectedStocks, e.g., fetch announcements for selected companies
    });

    // Fetch categories and populate the dropdown
        fetch(announcementCategoryApiUrl)
            .then(response => response.json())
            .then(data => {
                console.log(data);  // Log the response to see the structure
                if (Array.isArray(data)) {  // Ensure data is an array
                    data.forEach(category => {
                        const label = document.createElement('label');
                        const checkbox = document.createElement('input');
                        checkbox.type = "checkbox";
                        checkbox.value = category.categoryName;
                        checkbox.id = category.id;
                        checkbox.classList.add('category-checkbox');  // Use a different class for categories
                        
                        label.appendChild(checkbox);
                        label.appendChild(document.createTextNode(`${category.categoryName}`));
                        categoryDropdown.appendChild(label);
                        categoryDropdown.appendChild(document.createElement('br'));  // Line break between checkboxes
                    });
                } else {
                    console.error("Expected an array, but got:", data);
                }
            })
            .catch(error => console.error("Error fetching categories:", error));

    // Toggle the dropdown visibility
    announcementTypeSelectBtn.addEventListener('click', (event) => {
        const isHidden = categoryDropdown.classList.contains('hidden');
        categoryDropdown.classList.toggle('hidden', !isHidden); // Toggle hidden class
        event.stopPropagation();  // Prevent event from propagating
    });

    // Close dropdown if clicking outside
    document.addEventListener('click', (event) => {
        if (!categoryDropdown.contains(event.target) && !announcementTypeSelectBtn.contains(event.target)) {
            categoryDropdown.classList.add('hidden');  // Hide the dropdown if clicking outside
        }
    });

    // Handle checkbox changes (multiple selection logic)
    categoryDropdown.addEventListener('change', () => {
        const selectedCategories = [];
        document.querySelectorAll('.stock-checkbox:checked').forEach(checkbox => {
            selectedCategories.push(checkbox.value);
        });
        console.log("Selected Stocks:", selectedCategories);
        // You can now handle selectedStocks, e.g., fetch announcements for selected companies
    });

        
    

    

    // Template selection logic
    templateButtons.forEach(button => {
        button.addEventListener('click', () => {
            const templateName = button.getAttribute('data-template');
            
            if (templateName === 'Live Data') {
                fetchAnnouncements();
            } else {
                // Clear announcements for other templates
                announcementsDiv.innerHTML = '<p class="p-4 text-gray-500">No announcements for this template.</p>';
                announcementDetailsDiv.innerHTML = `
                    <h2 class="text-2xl font-bold mb-4">${templateName}</h2>
                    <div class="prose">
                        <p>No announcements available for this template.</p>
                    </div>
                `;
            }
        });
    });

    // Fetch announcements function
    function fetchAnnouncements() {
        const currentDate = new Date().toISOString().split('T')[0];
        const previousDate = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

        fetch(apiUrl)
        .then(response => response.json())
        .then(stockData => {
            const companyIds = stockData.content.map(stock => stock.securityId).join(',');
            
            return fetch(noticeApiUrl, {
                method: 'POST',
                body: new URLSearchParams({
                    fromDate: previousDate,
                    toDate: currentDate,
                    companyIds: companyIds
                })
            });
        })
        .then(response => response.json())
        .then(data => {
            const announcements = data.approvedAnnouncements || [];
            
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

            // Add event listeners to announcement buttons
            document.querySelectorAll('.announcement-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const announcementId = btn.getAttribute('data-announcement-id');
                    fetchAnnouncementDetails(announcementId);
                });
            });
        })
        .catch(error => {
            console.error("Error fetching announcements:", error);
            announcementsDiv.innerHTML = "<p class='p-4 text-red-500'>Error fetching announcements.</p>";
        });
    }

    // Fetch announcement details
    function fetchAnnouncementDetails(announcementId) {
        const formData = new FormData();
        formData.append('announcementId', announcementId);

        fetch(announcementDetailUrl, { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            const announcement = data.reqBaseAnnouncement;
            const docs = data.reqAnnouncementDocs;

            if (!announcement) {
                return fetchFallbackAnnouncementDetails(announcementId);
            }

            renderAnnouncementDetails(announcement, docs);
        })
        .catch(error => {
            console.error('Error fetching announcement details:', error);
            fetchFallbackAnnouncementDetails(announcementId);
        });
    }

    // Fallback method to fetch announcement details
    function fetchFallbackAnnouncementDetails(announcementId) {
        fetch(fallbackAnnouncementDetailUrl, { 
            method: 'POST', 
            body: new URLSearchParams({ announcementId }) 
        })
        .then(response => response.json())
        .then(data => {
            const announcement = data.reqBaseAnnouncement;
            const docs = data.reqAnnouncementDocs;
            renderAnnouncementDetails(announcement, docs);
        })
        .catch(error => {
            console.error('Error fetching fallback announcement details:', error);
            announcementDetailsDiv.innerHTML = "<p class='text-red-500'>Failed to load announcement details.</p>";
        });
    }

    // Render announcement details
    function renderAnnouncementDetails(announcement, docs) {
        if (!announcement) {
            announcementDetailsDiv.innerHTML = "<p class='text-red-500'>No details available.</p>";
            return;
        }

        let detailsHtml = `
            <h2 class="text-2xl font-bold mb-4">${announcement.title || 'Announcement Details'}</h2>
            <div class="prose">
        `;

        // Render announcement properties
        Object.keys(announcement).forEach(key => {
            if (announcement[key] !== null && announcement[key] !== undefined && key !== 'title') {
                detailsHtml += `
                    <p>
                        <strong>${capitalizeFirstLetter(key.replace(/([A-Z])/g, ' $1'))}:</strong> 
                        ${announcement[key]}
                    </p>
                `;
            }
        });

        // Render documents if available
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

    // Helper function to capitalize first letter
    function capitalizeFirstLetter(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    // Initial load of Live Data template
    fetchAnnouncements();
});