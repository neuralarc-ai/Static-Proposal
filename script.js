// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    
    // Initialize page-specific functionality
    initLoginPage();
    initDashboard();
    initProposalGeneration();
});

// ===================================
// LOGIN PAGE
// ===================================
function initLoginPage() {
    const pinInputs = document.querySelectorAll('.pin-digit');
    const roleButtons = document.querySelectorAll('.role-btn');
    const loginForm = document.getElementById('loginForm');
    
    if (!pinInputs.length) return;
    
    // Role selection
    roleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            roleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // PIN input handling
    pinInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            if (this.value.length === 1 && index < pinInputs.length - 1) {
                pinInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                pinInputs[index - 1].focus();
            }
        });
        
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text');
            const digits = pastedData.replace(/\D/g, '').split('').slice(0, 4);
            
            digits.forEach((digit, i) => {
                if (pinInputs[i]) {
                    pinInputs[i].value = digit;
                }
            });
            
            if (digits.length === 4) {
                pinInputs[3].focus();
            }
        });
    });
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const pin = Array.from(pinInputs).map(input => input.value).join('');
            const activeRole = document.querySelector('.role-btn.active').dataset.role;
            
            if (pin.length === 4) {
                // Simulate login
                if (activeRole === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'partner-dashboard.html';
                }
            }
        });
    }
}

// ===================================
// DASHBOARD NAVIGATION
// ===================================
function initDashboard() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page) {
                window.location.href = page;
            }
        });
    });
}

// ===================================
// PROPOSAL GENERATION
// ===================================
function initProposalGeneration() {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatForm) return;
    
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        addChatMessage(message, 'user');
        chatInput.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            const response = generateProposalResponse(message);
            addChatMessage(response, 'assistant');
            
            // Show proposal generation button
            setTimeout(() => {
                showProposalGenerationOption();
            }, 1000);
        }, 1500);
    });
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = sender === 'user' ? 'P' : 'AI';
    
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = message;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateProposalResponse(message) {
    return `Based on your requirements, I can help you create a comprehensive proposal. Here's what I understand:

• Project scope and requirements
• Timeline and deliverables
• Pricing based on your custom rate card

Would you like me to generate a detailed proposal document?`;
}

function showProposalGenerationOption() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const actionDiv = document.createElement('div');
    actionDiv.className = 'chat-message assistant';
    actionDiv.innerHTML = `
        <div class="chat-avatar">AI</div>
        <div class="chat-bubble">
            <button class="btn-primary btn-sm" onclick="generateProposal()">
                <i data-lucide="file-text"></i>
                Generate Proposal
            </button>
        </div>
    `;
    
    chatMessages.appendChild(actionDiv);
    lucide.createIcons();
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateProposal() {
    // Simulate proposal generation
    window.location.href = 'proposal-view.html?id=new';
}

// ===================================
// MODAL FUNCTIONS
// ===================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// ===================================
// PARTNER MANAGEMENT
// ===================================
function addPartner() {
    openModal('addPartnerModal');
}

function savePartner() {
    // Get form data
    const form = document.getElementById('partnerForm');
    if (!form) return;
    
    const formData = new FormData(form);
    
    // Simulate saving
    console.log('Saving partner:', Object.fromEntries(formData));
    
    // Close modal and refresh
    closeModal('addPartnerModal');
    
    // Show success message
    alert('Partner added successfully!');
}

function editPartner(partnerId) {
    console.log('Editing partner:', partnerId);
    openModal('addPartnerModal');
}

function deletePartner(partnerId) {
    if (confirm('Are you sure you want to delete this partner?')) {
        console.log('Deleting partner:', partnerId);
        // Simulate deletion
        alert('Partner deleted successfully!');
    }
}

// ===================================
// PRICE LIST MANAGEMENT
// ===================================
function addPriceList() {
    openModal('addPriceListModal');
}

function savePriceList() {
    const form = document.getElementById('priceListForm');
    if (!form) return;
    
    const formData = new FormData(form);
    console.log('Saving price list:', Object.fromEntries(formData));
    
    closeModal('addPriceListModal');
    alert('Price list saved successfully!');
}

function editPriceList(partnerId) {
    console.log('Editing price list for partner:', partnerId);
    openModal('addPriceListModal');
}

// ===================================
// PROPOSAL FUNCTIONS
// ===================================
function viewProposal(proposalId) {
    window.location.href = `proposal-view.html?id=${proposalId}`;
}

function exportProposalPDF() {
    // Simulate PDF export
    alert('Exporting proposal as PDF...\n\nIn a production environment, this would generate a PDF file using a library like jsPDF or html2pdf.');
}

function requestMoreInfo() {
    openModal('requestInfoModal');
}

function sendInfoRequest() {
    const message = document.getElementById('infoRequestMessage');
    if (!message || !message.value.trim()) {
        alert('Please enter your question.');
        return;
    }
    
    // Simulate sending email
    console.log('Sending info request:', message.value);
    
    closeModal('requestInfoModal');
    alert('Your request has been sent to the admin team. They will respond via email shortly.');
    
    message.value = '';
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'index.html';
    }
}

function formatCurrency(amount, currency = 'USD') {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    });
    return formatter.format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ===================================
// SAMPLE DATA GENERATION
// ===================================
function generateSampleProposals() {
    return [
        {
            id: 1,
            title: 'E-commerce Platform Development',
            client: 'TechCorp Inc.',
            date: '2024-12-01',
            value: 45000,
            currency: 'USD',
            status: 'pending'
        },
        {
            id: 2,
            title: 'Mobile App Development',
            client: 'StartupXYZ',
            date: '2024-11-28',
            value: 32000,
            currency: 'USD',
            status: 'approved'
        },
        {
            id: 3,
            title: 'CRM System Integration',
            client: 'Enterprise Solutions',
            date: '2024-11-25',
            value: 28000,
            currency: 'USD',
            status: 'draft'
        }
    ];
}