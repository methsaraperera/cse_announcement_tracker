import { initializeDropdowns } from './dropdowns.js';
import { fetchStocks, fetchCategories, fetchAnnouncements, fetchAnnouncementDetails } from './dataFetchers.js';
import { populateStockDropdown, populateCategoryDropdown, renderAnnouncements, renderAnnouncementDetails } from './ui.js';

document.addEventListener("DOMContentLoaded", async () => {
    // Initialize dropdowns and get filter manager instance
    const filterManager = initializeDropdowns();

    // Initialize dropdowns
    //initializeDropdowns();

    // Fetch and populate initial data
    const stocks = await fetchStocks();
    populateStockDropdown(stocks);

    const categories = await fetchCategories();
    populateCategoryDropdown(categories);

    // Template button functionality
    const templateButtons = document.querySelectorAll('.template-btn');
    templateButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const templateName = button.getAttribute('data-template');
            
            if (templateName === 'Live Data') {
                const announcements = await fetchAnnouncements();
                renderAnnouncements(announcements);
            } else {
                document.getElementById('announcements').innerHTML = 
                    '<p class="p-4 text-gray-500">No announcements for this template.</p>';
                document.getElementById('announcementDetails').innerHTML = `
                    <h2 class="text-2xl font-bold mb-4">${templateName}</h2>
                    <div class="prose">
                        <p>No announcements available for this template.</p>
                    </div>
                `;
            }
        });
    });

    // Add event delegation for announcement clicks
    document.getElementById('announcements').addEventListener('click', async (event) => {
        const announcementBtn = event.target.closest('.announcement-btn');
        if (announcementBtn) {
            const announcementId = announcementBtn.getAttribute('data-announcement-id');
            const details = await fetchAnnouncementDetails(announcementId);
            if (details) {
                renderAnnouncementDetails(details.reqBaseAnnouncement, details.reqAnnouncementDocs);
            }
        }
    });

    // Clear all filters button
    const clearFiltersButton = document.getElementById('clearFilters');
    clearFiltersButton.addEventListener('click', () => {
        filterManager.clearAllFilters();
        // Uncheck all checkboxes
        document.querySelectorAll('.stock-checkbox, .category-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    // Initial load of Live Data template
    const initialAnnouncements = await fetchAnnouncements();
    renderAnnouncements(initialAnnouncements);
});