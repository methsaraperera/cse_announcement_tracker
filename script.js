document.addEventListener("DOMContentLoaded", () => {
    const stockDropdown = document.getElementById('stockDropdown');
    const getDetailsBtn = document.getElementById('getDetailsBtn');
    const announcementsDiv = document.getElementById('announcements');
    const apiUrl = "https://www.cse.lk/api/cntSecurity";
    const noticeApiUrl = "https://www.cse.lk/api/approvedAnnouncement";
    const announcementDetailUrl = "https://www.cse.lk/api/getGeneralAnnouncementById";
    const fallbackAnnouncementDetailUrl = "https://www.cse.lk/api/getAnnouncementById";
    const dropdownButton = document.querySelector('.dropdown-btn');

    // Fetch stocks
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const stocks = data.content;
            stocks.forEach(stock => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = "checkbox";
                checkbox.value = stock.securityId;
                checkbox.id = stock.symbol;

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(`${stock.name} (${stock.symbol})`));
                stockDropdown.appendChild(label);
            });
        })
        .catch(error => console.error("Error fetching stocks:", error));

    // Toggle dropdown visibility when clicking the dropdown button
    dropdownButton.addEventListener('click', (event) => {
        stockDropdown.style.display = stockDropdown.style.display === 'block' ? 'none' : 'block';
        event.stopPropagation();  // Prevent event from propagating and closing the dropdown
    });

    // Prevent dropdown from closing when clicking inside it
    stockDropdown.addEventListener('click', (event) => {
        event.stopPropagation();  // Prevent event from propagating to document
    });

    // Close the dropdown if you click anywhere outside of it
    document.addEventListener('click', () => {
        stockDropdown.style.display = 'none';
    });

    // Handle the "Get Details" button click
    getDetailsBtn.addEventListener('click', () => {
        const selectedStocks = [];
        const checkboxes = stockDropdown.querySelectorAll('input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            selectedStocks.push(checkbox.value);
        });

        if (selectedStocks.length === 0) {
            alert('Please select at least one stock!');
            return;
        }

        const currentDate = new Date().toISOString().split('T')[0];  // Current date in YYYY-MM-DD format
        const previousDate = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
        
        const companyIds = selectedStocks.join(',');

        const url = `${noticeApiUrl}?fromDate=${previousDate}&toDate=${currentDate}&companyIds=${companyIds}`;

        fetch(url, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                // Check if 'approvedAnnouncements' key exists and contains data
                const announcements = data.approvedAnnouncements || [];
                
                if (announcements.length === 0) {
                    announcementsDiv.innerHTML = "<p>No announcements found for the selected stocks.</p>";
                } else {
                    let htmlContent = '<ul>';
                    announcements.forEach(announcement => {
                        htmlContent += 
                            `<li>
                                <strong>${announcement.announcementCategory}</strong><br>
                                Company: ${announcement.company}<br>
                                Date: ${announcement.dateOfAnnouncement || 'N/A'}<br>
                                <button class="viewDetailsBtn" data-announcement-id="${announcement.announcementId}">View Details</button>
                                <br><br>
                            </li>`;
                    });
                    htmlContent += '</ul>';
                    announcementsDiv.innerHTML = htmlContent;
                }

                // Attach click event listeners to all "View Details" buttons
                const viewDetailsBtns = document.querySelectorAll('.viewDetailsBtn');
                viewDetailsBtns.forEach(button => {
                    button.addEventListener('click', (event) => {
                        const announcementId = event.target.getAttribute('data-announcement-id');
                        showAnnouncementDetails(announcementId);
                    });
                });
            })
            .catch(error => {
                announcementsDiv.innerHTML = "<p>Error fetching announcements. Please try again later.</p>";
                console.error("Error fetching announcements:", error);
            });
    });

    // Show the details of the selected announcement in a modal
    function showAnnouncementDetails(announcementId) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
    
        // Create form data for the first API (General Announcement by ID)
        const formData = new FormData();
        formData.append('announcementId', announcementId);
    
        // Try the first API first (General Announcement by ID)
        fetch(announcementDetailUrl, {
            method: 'POST',
            body: formData  // Send form data
        })
        .then(response => response.json())
        .then(data => {
            const announcement = data.reqBaseAnnouncement;
    
            if (announcement) {
                renderModalContent(announcement, data.reqAnnouncementDocs);
            } else {
                // If the first API fails, try the fallback method
                fetchFallbackAnnouncementDetails(announcementId);
            }
        })
        .catch(error => {
            console.error('Error fetching announcement details from the first API:', error);
            // If the first API fails, try the fallback method
            fetchFallbackAnnouncementDetails(announcementId);
        });
    }

    // Fetch details from the fallback API (getAnnouncementById)
    function fetchFallbackAnnouncementDetails(announcementId) {
        fetch(fallbackAnnouncementDetailUrl, {
            method: 'POST',
            body: new URLSearchParams({ announcementId }) // Using URLSearchParams for POST data
        })
        .then(response => response.json())
        .then(data => {
            const announcement = data.reqBaseAnnouncement;
            if (announcement) {
                renderModalContent(announcement, data.reqAnnouncementDocs);
            } else {
                announcementsDiv.innerHTML = "<p>Announcement details not found.</p>";
            }
        })
        .catch(error => {
            console.error('Error fetching announcement details from the fallback API:', error);
            announcementsDiv.innerHTML = "<p>Error fetching announcement details. Please try again later.</p>";
        });
    }

    // Render the modal content with announcement details dynamically
    function renderModalContent(announcement, docs) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
    
        // Start building the modal content
        let modalContent = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h2>${announcement.title || 'No Title'}</h2>
        `;

        // Iterate over all properties of the announcement object and show only non-null values
        Object.keys(announcement).forEach(key => {
            if (announcement[key] !== null && announcement[key] !== undefined && key !== 'title') {
                modalContent += `
                    <p><strong>${capitalizeFirstLetter(key.replace(/([A-Z])/g, ' $1'))}:</strong> ${announcement[key]}</p>
                `;
            }
        });

        // Add documents if any
        if (docs && docs.length > 0) {
            modalContent += '<h3>Documents:</h3><ul>';
            docs.forEach(doc => {
                modalContent += `
                    <li>
                        <button class="viewPdfBtn" data-file-url="${doc.fileUrl}">
                            ${doc.fileOriginalName} (PDF)
                        </button>
                    </li>
                `;
            });
            modalContent += '</ul>';
        }

        modalContent += '</div>';
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
    
        // Attach click event listeners for opening PDFs in a new tab
        const viewPdfBtns = modal.querySelectorAll('.viewPdfBtn');
        viewPdfBtns.forEach(button => {
            button.addEventListener('click', (event) => {
                const fileUrl = event.target.getAttribute('data-file-url');
                openPdfInNewTab(fileUrl);  // Open the PDF when clicked
            });
        });

        // Close modal on click of close button
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    
        // Close modal if clicked outside of modal content
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Function to open the PDF in a new tab using fetch and the provided cookie
    function openPdfInNewTab(fileUrl) {
        const pdfUrl = `https://cdn.cse.lk/${fileUrl}`;
        
        // Open the PDF URL in a new tab
        window.open(pdfUrl, '_blank');
    }

    // Helper function to capitalize the first letter of each word in a string
    function capitalizeFirstLetter(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }
});
