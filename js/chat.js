// R1 Chat Application - P2P Chat
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing R1 Chat app...');
    
    // UI Elements
    const menuBtn = document.getElementById('menu-btn');
    const menu = document.getElementById('menu');
    const menuItems = document.querySelectorAll('#menu li');
    const statusMessage = document.getElementById('status-message');
    
    // Onboarding Elements
    const usernameInput = document.getElementById('username-input');
    const statusInput = document.getElementById('status-input');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    console.log('Save profile button found:', saveProfileBtn);
    
    // Friends Elements
    const friendsList = document.getElementById('friends-list');
    const friendCount = document.getElementById('friend-count');
    const friendNameInput = document.getElementById('friend-name');
    const addFriendBtn = document.getElementById('add-friend-btn');
    
    // Chat Elements
    const chatList = document.getElementById('chat-list');
    const backBtn = document.getElementById('back-btn');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const messages = document.getElementById('messages');
    const chatUsername = document.getElementById('chat-username');
    const chatStatus = document.getElementById('chat-status');
    
    // Profile Elements
    const profileInitial = document.getElementById('profile-initial');
    const profileUsername = document.getElementById('profile-username');
    const profileStatus = document.getElementById('profile-status');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    
    // App State
    let currentUser = null;
    let friends = [];
    let chats = {};
    let activeChat = null;
    
    // Initialize local storage for testing
    if (typeof localStorage !== 'undefined' && !localStorage.getItem('r1_chat_initialized')) {
        console.log('Initializing local storage for testing');
        localStorage.setItem('r1_chat_initialized', 'true');
        // Add sample friends
        const sampleFriends = [
            { id: 'f1234', username: 'Alice', status: 'online', lastSeen: new Date().toISOString() },
            { id: 'f5678', username: 'Bob', status: 'offline', lastSeen: new Date().toISOString() }
        ];
        localStorage.setItem('r1_chat_friends', JSON.stringify(sampleFriends));
        
        // Add sample chats
        const sampleChats = {
            'f1234': [
                { id: 'm1', sender: 'f1234', content: 'Hi there!', timestamp: new Date().toISOString() },
                { id: 'm2', sender: 'me', content: 'Hello! How are you?', timestamp: new Date().toISOString() }
            ]
        };
        localStorage.setItem('r1_chat_messages', JSON.stringify(sampleChats));
    }
    
    // Initialize App
    initApp();
    
    // Initialize the app
    function initApp() {
        // Log that we're starting initialization
        console.log('Initializing app...');
        
        // Debug all UI elements to ensure they're found
        console.log('Menu button:', menuBtn);
        console.log('Menu:', menu);
        console.log('Add friend button:', addFriendBtn);
        
        // Start directly with onboarding for testing
        showPage('onboarding');
        
        // Check if user exists (but don't wait for it)
        loadUserProfile().then(user => {
            if (user) {
                currentUser = user;
                showPage('chats');
                updateProfileUI();
                loadFriends();
                loadChats();
            }
            // If no user, we're already on onboarding screen
        }).catch(err => {
            console.error('Error loading profile:', err);
            // Stay on onboarding screen in case of error
        });
        
        // Set up menu toggle with robust error handling
        if (menuBtn) {
            // Remove any existing listeners first
            const newMenuBtn = menuBtn.cloneNode(true);
            menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);
            
            // Add fresh event listener
            newMenuBtn.addEventListener('click', (e) => {
                console.log('Menu button clicked');
                e.preventDefault();
                e.stopPropagation();
                toggleMenu();
                return false;
            });
            
            // Update reference
            menuBtn = newMenuBtn;
        } else {
            console.error('Menu button not found!');
        }
        
        // Set up navigation with robust error handling
        const navItems = document.querySelectorAll('#menu li.nav-item');
        navItems.forEach(item => {
            if (item) {
                // Remove any existing listeners first
                const newItem = item.cloneNode(true);
                item.parentNode.replaceChild(newItem, item);
                
                // Add fresh event listener
                newItem.addEventListener('click', (e) => {
                    const page = newItem.getAttribute('data-page');
                    console.log('Menu item clicked:', page);
                    e.preventDefault();
                    e.stopPropagation();
                    navigateTo(page);
                    toggleMenu();
                    return false;
                });
            }
        });
        
        // Set up onboarding form
        if (saveProfileBtn) {
            console.log('Setting up save profile button:', saveProfileBtn);
            // Remove existing listeners
            const newSaveBtn = saveProfileBtn.cloneNode(true);
            saveProfileBtn.parentNode.replaceChild(newSaveBtn, saveProfileBtn);
            
            // Add fresh event listener
            newSaveBtn.addEventListener('click', function(e) {
                console.log('Save profile button clicked');
                e.preventDefault();
                saveProfile(e);
            });
            
            console.log('Save profile event listener added');
        } else {
            console.error('Save profile button not found');
        }
        
        // Set up friends
        if (addFriendBtn) {
            addFriendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                addFriend();
            });
        }
        
        if (friendNameInput) {
            friendNameInput.addEventListener('keypress', event => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    addFriend();
                }
            });
        }
        
        // Set up chat
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                navigateTo('chats');
            });
        }
        
        if (sendBtn && messageInput) {
            sendBtn.addEventListener('click', sendMessage);
            messageInput.addEventListener('keypress', event => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    sendMessage();
                }
            });
        }
        
        // Set up profile
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                // Populate fields with current values
                if (currentUser) {
                    usernameInput.value = currentUser.username;
                    statusInput.value = currentUser.status;
                    showPage('onboarding');
                }
            });
        }
        
        // Set up R1 device specific handlers
        setupHardwareEvents();
        
        updateStatus('Welcome to R1 Chat');
    }
    
    // Setup hardware events for R1 device
    function setupHardwareEvents() {
        // Scroll wheel for navigation in chat
        if (window.addEventListener) {
            window.addEventListener('scrollUp', () => {
                if (messages.scrollTop > 0) {
                    messages.scrollTop -= 20;
                }
            });
            
            window.addEventListener('scrollDown', () => {
                if (messages.scrollTop < messages.scrollHeight - messages.clientHeight) {
                    messages.scrollTop += 20;
                }
            });
            
            // PTT button to open menu or send message
            window.addEventListener('sideClick', () => {
                if (document.getElementById('chat-detail').classList.contains('active') && 
                    messageInput.value.trim()) {
                    sendMessage();
                } else {
                    toggleMenu();
                }
            });
        }
    }
    
    // Toggle menu
    function toggleMenu() {
        console.log('Toggling menu');
        
        // Find the menu element
        const menu = document.getElementById('menu');
        
        if (!menu) {
            console.error('Menu element not found!');
            return;
        }
        
        // Check if menu is active (visible)
        const isActive = menu.classList.contains('active');
        
        // Toggle the active class
        if (isActive) {
            menu.classList.remove('active');
            console.log('Menu hidden');
        } else {
            menu.classList.remove('hidden'); // Remove hidden class if present
            
            // Force a reflow before adding the active class for transition
            void menu.offsetWidth;
            
            menu.classList.add('active');
            console.log('Menu shown');
        }
    }
    
    // Navigate to a page
    function navigateTo(page) {
        console.log('Navigating to:', page);
        
        if (!page) {
            console.error('Invalid page parameter in navigateTo');
            return;
        }
        
        // Update active menu item
        const menuItems = document.querySelectorAll('#menu li.nav-item');
        menuItems.forEach(item => {
            const itemPage = item.getAttribute('data-page');
            if (itemPage === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Handle special case for chat detail
        if (page === 'chat-detail') {
            showPage(page);
            return;
        }
        
        showPage(page);
    }
    
    // Show a specific page
    function showPage(pageId) {
        console.log('Showing page:', pageId);
        
        // Get all pages and clean their classes first
        const pages = document.querySelectorAll('.page');
        console.log('Found', pages.length, 'pages');
        
        pages.forEach(page => {
            // Remove active class from all pages
            page.classList.remove('active');
            page.classList.remove('hidden');
            console.log('Removed classes from', page.id || 'unknown page');
        });
        
        // Then try to find the target page - check multiple ways
        const targetPageId = pageId.endsWith('-page') ? pageId : pageId;
        let targetPage = document.getElementById(targetPageId);
        if (!targetPage) {
            targetPage = document.getElementById(targetPageId + '-page');
        }
        if (!targetPage && targetPageId === 'onboarding') {
            targetPage = document.querySelector('#onboarding');
        }
        
        if (targetPage) {
            // Force a reflow before adding the active class
            void targetPage.offsetWidth;
            targetPage.classList.add('active');
            // Ensure page is visible with inline styles as a fallback
            targetPage.style.display = 'block';
            targetPage.style.opacity = '1';
            console.log('Activated page:', targetPage.id);
        } else {
            console.error('Target page not found:', pageId, 'or', pageId + '-page');
        }
        
        // Update header title
        const pageTitle = document.getElementById('page-title');
        if (!pageTitle) {
            console.error('Page title element not found');
            return;
        }
        
        switch(targetPageId) {
            case 'onboarding':
                pageTitle.textContent = 'Setup Profile';
                break;
            case 'chats':
            case 'chats-page':
                pageTitle.textContent = 'R1 Chat';
                break;
            case 'friends':
            case 'friends-page':
                pageTitle.textContent = 'Friends';
                break;
            case 'profile':
            case 'profile-page':
                pageTitle.textContent = 'My Profile';
                break;
            case 'chat-detail':
                pageTitle.textContent = activeChat ? getFriendName(activeChat) : 'Chat';
                break;
            default:
                pageTitle.textContent = 'R1 Chat';
        }
        
        // Update status with page name
        updateStatus('Viewing ' + pageTitle.textContent);
    }
    
    // Helper function to get friend name from ID
    function getFriendName(friendId) {
        const friend = friends.find(f => f.id === friendId);
        return friend ? friend.username : 'Chat';
    }
    
    // Load user profile from storage
    async function loadUserProfile() {
        try {
            if (window.creationStorage && window.creationStorage.plain) {
                const stored = await window.creationStorage.plain.getItem('r1_chat_user');
                if (stored) {
                    return JSON.parse(atob(stored));
                }
            } else {
                // Fallback for testing
                const storedUser = localStorage.getItem('r1_chat_user');
                if (storedUser) {
                    return JSON.parse(storedUser);
                }
            }
            return null;
        } catch (error) {
            console.error('Error loading user profile:', error);
            return null;
        }
    }
    
    // Save user profile to storage
    async function saveUserProfile(user) {
        try {
            if (window.creationStorage && window.creationStorage.plain) {
                await window.creationStorage.plain.setItem(
                    'r1_chat_user',
                    btoa(JSON.stringify(user))
                );
            } else {
                // Fallback for testing
                localStorage.setItem('r1_chat_user', JSON.stringify(user));
            }
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    }
    
    // Save the profile from onboarding form
    function saveProfile(e) {
        if (e) e.preventDefault();
        
        console.log('Saving profile...');
        console.log('Username input:', usernameInput);
        
        if (!usernameInput) {
            console.error('Username input not found');
            updateStatus('Error: Username input not found');
            return;
        }
        
        const username = usernameInput.value.trim();
        const status = statusInput ? statusInput.value.trim() : "Available";
        
        console.log('Username:', username);
        console.log('Status:', status);
        
        if (!username) {
            updateStatus('Username is required');
            return;
        }
        
        const user = {
            username: username,
            status: status || "Available",
            created: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
        
        console.log('New user object:', user);
        
        currentUser = user;
        
        // Use setTimeout to ensure any UI updates happen after this
        setTimeout(() => {
            saveUserProfile(user).then(() => {
                console.log('Profile saved successfully');
                updateProfileUI();
                showPage('chats');
                updateStatus('Profile saved');
                
                // Force friends to load after profile is saved
                loadFriends();
                loadChats();
            }).catch(err => {
                console.error('Error saving profile:', err);
                updateStatus('Error saving profile');
            });
        }, 100);
    }
    
    // Update profile UI elements
    function updateProfileUI() {
        if (!currentUser) return;
        
        // Update profile page
        profileInitial.textContent = currentUser.username.charAt(0).toUpperCase();
        profileUsername.textContent = currentUser.username;
        profileStatus.textContent = currentUser.status;
    }
    
    // Load friends from storage
    async function loadFriends() {
        try {
            if (window.creationStorage && window.creationStorage.plain) {
                const stored = await window.creationStorage.plain.getItem('r1_chat_friends');
                if (stored) {
                    friends = JSON.parse(atob(stored));
                    updateFriendsUI();
                }
            } else {
                // Fallback for testing
                const storedFriends = localStorage.getItem('r1_chat_friends');
                if (storedFriends) {
                    friends = JSON.parse(storedFriends);
                } else {
                    // Add demo friends for testing
                    friends = [
                        { id: 'f1', username: 'Alice', status: 'online', lastSeen: new Date().toISOString() },
                        { id: 'f2', username: 'Bob', status: 'offline', lastSeen: new Date(Date.now() - 3600000).toISOString() }
                    ];
                }
                updateFriendsUI();
            }
        } catch (error) {
            console.error('Error loading friends:', error);
        }
    }
    
    // Save friends to storage
    async function saveFriends() {
        try {
            if (window.creationStorage && window.creationStorage.plain) {
                await window.creationStorage.plain.setItem(
                    'r1_chat_friends',
                    btoa(JSON.stringify(friends))
                );
            } else {
                // Fallback for testing
                localStorage.setItem('r1_chat_friends', JSON.stringify(friends));
            }
        } catch (error) {
            console.error('Error saving friends:', error);
        }
    }
    
    // Update friends UI
    function updateFriendsUI() {
        // Clear existing list
        friendsList.innerHTML = '';
        
        // Update count
        friendCount.textContent = friends.length;
        
        if (friends.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = '<p>No friends yet</p><p>Add friends to start chatting</p>';
            friendsList.appendChild(emptyState);
            return;
        }
        
        // Add each friend
        friends.forEach(friend => {
            const friendItem = document.createElement('div');
            friendItem.className = 'friend-item';
            friendItem.dataset.id = friend.id;
            
            const friendInfo = document.createElement('div');
            friendInfo.className = 'friend-info';
            
            const avatar = document.createElement('div');
            avatar.className = 'friend-avatar';
            avatar.textContent = friend.username.charAt(0).toUpperCase();
            
            const status = document.createElement('div');
            status.className = `friend-status ${friend.status}`;
            
            const name = document.createElement('div');
            name.className = 'friend-name';
            name.textContent = friend.username;
            
            const actions = document.createElement('div');
            actions.className = 'friend-actions';
            
            const chatAction = document.createElement('div');
            chatAction.className = 'friend-action chat';
            chatAction.innerHTML = '💬';
            chatAction.title = 'Chat';
            chatAction.addEventListener('click', () => startChat(friend));
            
            const removeAction = document.createElement('div');
            removeAction.className = 'friend-action remove';
            removeAction.innerHTML = '×';
            removeAction.title = 'Remove';
            removeAction.addEventListener('click', () => removeFriend(friend.id));
            
            friendInfo.appendChild(status);
            friendInfo.appendChild(avatar);
            friendInfo.appendChild(name);
            
            actions.appendChild(chatAction);
            actions.appendChild(removeAction);
            
            friendItem.appendChild(friendInfo);
            friendItem.appendChild(actions);
            
            friendsList.appendChild(friendItem);
        });
        
        // Update chat list as well since it's related
        updateChatListUI();
    }
    
    // Add a friend
    function addFriend() {
        console.log('Adding friend...');
        
        if (!friendNameInput) {
            console.error('Friend name input not found');
            updateStatus('Error adding friend');
            return;
        }
        
        const friendName = friendNameInput.value.trim();
        console.log('Friend name:', friendName);
        
        if (!friendName) {
            updateStatus('Friend name is required');
            return;
        }
        
        // Initialize friends array if not exists
        if (!Array.isArray(friends)) {
            friends = [];
        }
        
        // Check if friend already exists
        if (friends.some(f => f.username.toLowerCase() === friendName.toLowerCase())) {
            updateStatus('Friend already exists');
            return;
        }
        
        // Add new friend
        const newFriend = {
            id: 'f' + Date.now(),
            username: friendName,
            status: Math.random() > 0.5 ? 'online' : 'offline',
            lastSeen: new Date().toISOString()
        };
        
        console.log('New friend object:', newFriend);
        
        // Add to friends array
        friends.push(newFriend);
        
        // Save and update UI
        saveFriends();
        updateFriendsUI();
        
        // Create empty chat for this friend
        if (!chats[newFriend.id]) {
            chats[newFriend.id] = [];
            saveChats();
            updateChatListUI();
        }
        
        // Clear input
        friendNameInput.value = '';
        
        // Show success message
        updateStatus(`Friend ${friendName} added successfully!`);
    }
    
    // Remove a friend
    function removeFriend(friendId) {
        const friendToRemove = friends.find(f => f.id === friendId);
        if (!friendToRemove) return;
        
        const friendName = friendToRemove.username;
        
        // Remove from friends array
        friends = friends.filter(f => f.id !== friendId);
        
        // Remove associated chat
        if (chats[friendId]) {
            delete chats[friendId];
            saveChats();
        }
        
        saveFriends();
        updateFriendsUI();
        
        updateStatus(`Friend ${friendName} removed`);
    }
    
    // Load chats from storage
    async function loadChats() {
        try {
            if (window.creationStorage && window.creationStorage.plain) {
                const stored = await window.creationStorage.plain.getItem('r1_chat_messages');
                if (stored) {
                    chats = JSON.parse(atob(stored));
                    updateChatListUI();
                }
            } else {
                // Fallback for testing
                const storedChats = localStorage.getItem('r1_chat_messages');
                if (storedChats) {
                    chats = JSON.parse(storedChats);
                } else if (friends.length > 0) {
                    // Create sample chats for demo friends
                    const now = new Date();
                    chats = {
                        f1: [
                            { id: 'm1', sender: 'f1', content: 'Hi there!', timestamp: new Date(now - 3600000).toISOString() },
                            { id: 'm2', sender: 'me', content: 'Hello! How are you?', timestamp: new Date(now - 3500000).toISOString() },
                            { id: 'm3', sender: 'f1', content: 'I\'m good, thanks! Just testing this new R1 Chat app.', timestamp: new Date(now - 3400000).toISOString() }
                        ]
                    };
                }
                updateChatListUI();
            }
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    }
    
    // Save chats to storage
    async function saveChats() {
        try {
            if (window.creationStorage && window.creationStorage.plain) {
                await window.creationStorage.plain.setItem(
                    'r1_chat_messages',
                    btoa(JSON.stringify(chats))
                );
            } else {
                // Fallback for testing
                localStorage.setItem('r1_chat_messages', JSON.stringify(chats));
            }
        } catch (error) {
            console.error('Error saving chats:', error);
        }
    }
    
    // Update chat list UI
    function updateChatListUI() {
        // Clear existing list
        chatList.innerHTML = '';
        
        const chatKeys = Object.keys(chats);
        
        if (chatKeys.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = '<p>No conversations yet</p><p>Add friends to start chatting</p>';
            chatList.appendChild(emptyState);
            return;
        }
        
        // Sort chats by latest message
        const sortedChats = chatKeys.map(key => {
            const chat = chats[key];
            const friend = friends.find(f => f.id === key);
            const lastMessage = chat[chat.length - 1];
            
            return {
                id: key,
                friend: friend || { username: 'Unknown', status: 'offline' },
                lastMessage: lastMessage,
                timestamp: new Date(lastMessage.timestamp)
            };
        }).sort((a, b) => b.timestamp - a.timestamp);
        
        // Add each chat
        sortedChats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.dataset.id = chat.id;
            
            const avatar = document.createElement('div');
            avatar.className = 'chat-avatar';
            avatar.textContent = chat.friend.username.charAt(0).toUpperCase();
            
            const info = document.createElement('div');
            info.className = 'chat-info';
            
            const nameRow = document.createElement('div');
            nameRow.className = 'chat-name-row';
            
            const name = document.createElement('div');
            name.className = 'chat-name';
            name.textContent = chat.friend.username;
            
            const preview = document.createElement('div');
            preview.className = 'chat-preview';
            preview.textContent = chat.lastMessage ? 
                (chat.lastMessage.sender === 'me' ? 'You: ' : '') + chat.lastMessage.content : 
                'No messages';
            
            info.appendChild(name);
            info.appendChild(preview);
            
            chatItem.appendChild(avatar);
            chatItem.appendChild(info);
            
            chatItem.addEventListener('click', () => openChat(chat.id));
            
            chatList.appendChild(chatItem);
        });
    }
    
    // Start a chat with a friend
    function startChat(friend) {
        // Ensure chat exists for this friend
        if (!chats[friend.id]) {
            chats[friend.id] = [];
        }
        
        openChat(friend.id);
    }
    
    // Open a chat
    function openChat(friendId) {
        const friend = friends.find(f => f.id === friendId);
        if (!friend) return;
        
        activeChat = friendId;
        
        // Update chat header
        chatUsername.textContent = friend.username;
        chatStatus.textContent = friend.status === 'online' ? 'Online' : 'Offline';
        chatStatus.style.color = friend.status === 'online' ? 'var(--success-color)' : '#95a5a6';
        
        // Load chat messages
        updateChatMessages(friendId);
        
        // Show chat detail
        showPage('chat-detail');
        
        // Focus message input
        setTimeout(() => {
            messageInput.focus();
        }, 300);
    }
    
    // Update chat messages
    function updateChatMessages(friendId) {
        // Clear existing messages
        messages.innerHTML = '';
        
        // Get chat
        const chat = chats[friendId] || [];
        
        if (chat.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-chat';
            emptyState.textContent = 'No messages yet. Say hello!';
            messages.appendChild(emptyState);
            return;
        }
        
        // Add each message
        chat.forEach(message => {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${message.sender === 'me' ? 'sent' : 'received'}`;
            
            const content = document.createElement('div');
            content.className = 'message-content';
            content.textContent = message.content;
            
            const time = document.createElement('div');
            time.className = 'message-time';
            time.textContent = formatTime(new Date(message.timestamp));
            
            messageEl.appendChild(content);
            messageEl.appendChild(time);
            
            messages.appendChild(messageEl);
        });
        
        // Scroll to bottom
        messages.scrollTop = messages.scrollHeight;
    }
    
    // Send a message
    function sendMessage() {
        const content = messageInput.value.trim();
        
        if (!content || !activeChat) {
            return;
        }
        
        // Create message
        const message = {
            id: 'm' + Date.now(),
            sender: 'me',
            content: content,
            timestamp: new Date().toISOString()
        };
        
        // Add to chat
        if (!chats[activeChat]) {
            chats[activeChat] = [];
        }
        
        chats[activeChat].push(message);
        
        // Save chats
        saveChats();
        
        // Update UI
        updateChatMessages(activeChat);
        updateChatListUI();
        
        // Clear input
        messageInput.value = '';
        
        // Simulate reply after a delay if this is a demo
        simulateReply(activeChat);
    }
    
    // Simulate reply (for demo purposes)
    function simulateReply(friendId) {
        const friend = friends.find(f => f.id === friendId);
        if (!friend || friend.status !== 'online') return;
        
        const responses = [
            'That\'s interesting!',
            'I agree with you.',
            'Tell me more about that.',
            'How\'s your day going?',
            'Nice to hear from you!',
            'Have you tried the new R1 features?',
            'What else is new?',
            'I\'m enjoying this chat app.',
            'The R1 device is amazing, isn\'t it?',
            'Let\'s meet up sometime soon.'
        ];
        
        // Select random response
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        // Random delay between 1-3 seconds
        const delay = Math.floor(Math.random() * 2000) + 1000;
        
        setTimeout(() => {
            // Create message
            const message = {
                id: 'm' + Date.now(),
                sender: friendId,
                content: response,
                timestamp: new Date().toISOString()
            };
            
            // Add to chat
            chats[friendId].push(message);
            
            // Save chats
            saveChats();
            
            // Update UI if this chat is still active
            if (activeChat === friendId) {
                updateChatMessages(friendId);
            }
            
            updateChatListUI();
            
            // Show notification
            if (activeChat !== friendId) {
                updateStatus(`New message from ${friend.username}`);
            }
        }, delay);
    }
    
    // Format time for chat messages
    function formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // Update status message
    function updateStatus(message) {
        statusMessage.textContent = message;
        
        // Clear after 3 seconds
        setTimeout(() => {
            statusMessage.textContent = '';
        }, 3000);
    }
});
