// Habit Tracker Application

class HabitTracker {
    constructor() {
        this.habits = this.loadFromLocalStorage();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        const addBtn = document.getElementById('addBtn');
        const habitInput = document.getElementById('habitInput');
        const filterBtns = document.querySelectorAll('.filter-btn');

        addBtn.addEventListener('click', () => this.addHabit());
        habitInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addHabit();
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
    }

    addHabit() {
        const input = document.getElementById('habitInput');
        const habitName = input.value.trim();

        if (!habitName) {
            alert('Please enter a habit name!');
            return;
        }

        const newHabit = {
            id: Date.now(),
            name: habitName,
            completed: false,
            createdDate: new Date().toISOString().split('T')[0],
            completedDates: [],
            streak: 0,
            totalDays: 0
        };

        this.habits.push(newHabit);
        this.saveToLocalStorage();
        input.value = '';
        this.render();
    }

    toggleHabit(id) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];
        const alreadyCompleted = habit.completedDates.includes(today);

        if (alreadyCompleted) {
            habit.completedDates = habit.completedDates.filter(d => d !== today);
            habit.completed = false;
        } else {
            habit.completedDates.push(today);
            habit.completed = true;
        }

        this.updateStreak(habit);
        this.saveToLocalStorage();
        this.render();
    }

    updateStreak(habit) {
        if (habit.completedDates.length === 0) {
            habit.streak = 0;
            habit.totalDays = 0;
            return;
        }

        habit.totalDays = habit.completedDates.length;
        const sortedDates = habit.completedDates.map(d => new Date(d)).sort((a, b) => b - a);
        
        let streak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedDates.length - 1; i++) {
            const diff = (sortedDates[i] - sortedDates[i + 1]) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
                streak++;
            } else {
                break;
            }
        }

        habit.streak = streak;
    }

    deleteHabit(id) {
        if (confirm('Are you sure you want to delete this habit?')) {
            this.habits = this.habits.filter(h => h.id !== id);
            this.saveToLocalStorage();
            this.render();
        }
    }

    getFilteredHabits() {
        if (this.currentFilter === 'completed') {
            return this.habits.filter(h => h.completed);
        } else if (this.currentFilter === 'pending') {
            return this.habits.filter(h => !h.completed);
        }
        return this.habits;
    }

    updateStats() {
        const totalHabits = this.habits.length;
        const completedToday = this.habits.filter(h => h.completed).length;
        const completionRate = totalHabits === 0 ? 0 : Math.round((completedToday / totalHabits) * 100);

        document.getElementById('totalHabits').textContent = totalHabits;
        document.getElementById('completedToday').textContent = completedToday;
        document.getElementById('completionRate').textContent = completionRate + '%';
    }

    render() {
        this.updateStats();
        const habitsList = document.getElementById('habitsList');
        const emptyState = document.getElementById('emptyState');
        const filteredHabits = this.getFilteredHabits();

        habitsList.innerHTML = '';

        if (filteredHabits.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        filteredHabits.forEach(habit => {
            const li = document.createElement('li');
            li.className = `habit-item ${habit.completed ? 'completed' : ''}`;
            
            const progressPercent = habit.totalDays === 0 ? 0 : Math.min(100, (habit.streak / Math.max(habit.totalDays, 1)) * 100);

            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="habit-checkbox" 
                    ${habit.completed ? 'checked' : ''}
                    data-id="${habit.id}"
                >
                <div class="habit-content">
                    <div class="habit-name">${this.escapeHtml(habit.name)}</div>
                    <div class="habit-streak">
                        <div class="streak-item">
                            🔥 <span class="streak-badge">${habit.streak} day streak</span>
                        </div>
                        <div class="streak-item">
                            📊 ${habit.totalDays} completed days
                        </div>
                    </div>
                    <div class="habit-progress">
                        <div class="habit-progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="btn-delete" data-id="${habit.id}">🗑️</button>
                </div>
            `;

            habitsList.appendChild(li);
        });

        this.attachEventListeners();
    }

    attachEventListeners() {
        const checkboxes = document.querySelectorAll('.habit-checkbox');
        const deleteButtons = document.querySelectorAll('.btn-delete');

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleHabit(parseInt(e.target.dataset.id));
            });
        });

        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteHabit(parseInt(e.target.dataset.id));
            });
        });
    }

    saveToLocalStorage() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('habits');
        return data ? JSON.parse(data) : [];
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HabitTracker();
    });
} else {
    new HabitTracker();
}