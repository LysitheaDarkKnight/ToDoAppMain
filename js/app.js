class ToDoTracker {
    constructor(){
        this._toDos = Storage.getToDos();
        this._totalToDo = Storage.getToDos().length;

        this._displayTotalToDo()
    }

    // Public Methods/API //

    createTodo(toDo){
        this._toDos.push(toDo);
        this._totalToDo = this._toDos.length
        Storage.setTotalToDos(this._totalToDo)
        Storage.saveToDos(toDo)
        this._displayNewtoDo(toDo)
        this._render();
    }

    deleteToDo(id){
        const index = this._toDos.findIndex((todo) => todo.id === id)

        if (index != -1) {
            this._totalToDo -= 1
            Storage.setTotalToDos(this._totalToDo)
            this._toDos.splice(index, 1)
            Storage.deleteToDo(id)
            this._render()
        }
        
    }

    toggleCompleted(id){
        this._toDos.forEach((todo) => {
            if(todo.id === id){
                todo.completed === false ? todo.completed = true : todo.completed = false
            }
        })
        localStorage.setItem('toDos', JSON.stringify(this._toDos))
    }

    clearCompleted() {

        const completedList = this._toDos.filter(todo => todo.completed === true)

        completedList.forEach(todo => {
                this.deleteToDo(todo.id)
        })
    }

    
    loadToDos() {
        this._toDos.forEach(todo => this._displayNewtoDo(todo))
        this._displayTotalToDo()
    }

    // Private Methods //

    _displayTotalToDo() {
        const totalToDoEl = document.getElementById('total-todo')
        totalToDoEl.innerHTML = (this._totalToDo).toString()
    }
    _displayNewtoDo(toDo) {

        const toDoEl = document.createElement('div');
        toDoEl.classList.add('todo-item')
        toDoEl.setAttribute('data-id', toDo.id)

        toDoEl.innerHTML = `
        <div class="checkbox-item" draggable="false">
          <input type="checkbox" class="input-checkbox" name="input-checkbox-${toDo.id}" id="${toDo.id}"  ${toDo.completed === true ? `checked` : `unchecked`}>
          <label class="${toDo.completed === true ? `line-through` : ``}" for="${toDo.id}">${toDo.sentence}</label>
          <button class="remove">
            <img src="images/icon-cross.svg" alt="" class= "cross">
          </button>
        </div>
      `

      const hero = document.querySelector('.hero')
      const options = document.querySelector('.options')

      hero.insertBefore(toDoEl, options);

    }
    _render() {
        this._displayTotalToDo()
    }
}

class ToDo {
    constructor(sentence, completed){
        this.id = Math.random().toString(16).slice(2)
        this.sentence = sentence;
        this.completed = completed;
    }
}

class Storage {

    static getToDos() {
        let toDos;

        if (localStorage.getItem('toDos') === null) {
            toDos = []
        } else {
            toDos = JSON.parse(localStorage.getItem('toDos'))
        }

        return toDos
    }

    static saveToDos(toDo) {
        const toDos = Storage.getToDos()
        toDos.push(toDo)
        localStorage.setItem('toDos', JSON.stringify(toDos))
    }



    static setTotalToDos(totalToDo) {
        localStorage.setItem('TotalToDo', totalToDo)
    }

    static deleteToDo(id) {
        const toDos = Storage.getToDos()
        toDos.forEach((todo, index) => {
            if (todo.id === id){
                toDos.splice(index, 1)
            }
        })

        localStorage.setItem('toDos', JSON.stringify(toDos))
    }

    static setInitialMode(){
        const isDarkMode = JSON.parse(localStorage.getItem('isDarkMode'));
        const background = document.querySelector('.background');
  
  
        if (isDarkMode) {
          document.body.classList.add('dark-mode');
          document.body.classList.remove('light-mode');
          document.getElementById('light').style.display = 'block'
          document.getElementById('dark').style.display = 'none'
  
          window.matchMedia('only screen and (max-width: 57.5rem)').matches ?
          background.style.backgroundImage = 'url(../todo-app-main/images/bg-mobile-dark.jpg)' : 
          background.style.backgroundImage = 'url(../todo-app-main/images/bg-desktop-dark.jpg)';
        } else {
          document.body.classList.remove('dark-mode');
          document.body.classList.add('light-mode');
          document.getElementById('light').style.display = 'none'
          document.getElementById('dark').style.display = 'block'
  
          window.matchMedia('only screen and (max-width: 57.5rem)').matches ?
          background.style.backgroundImage = 'url(../todo-app-main/images/bg-mobile-light.jpg)' : 
          background.style.backgroundImage = 'url(../todo-app-main/images/bg-desktop-light.jpg)';
        }

    }

}


class App{
    constructor(){
        this._tracker = new ToDoTracker()
        this._loadEventListeners()
        this._tracker.loadToDos()
    }

    _loadEventListeners(){
        document.getElementById('create').addEventListener('submit', this._newToDo.bind(this))
        document.getElementById('search-todos').addEventListener('keyup', this._searchToDos.bind(this))
        document.querySelector('.hero').
        addEventListener('click', this._deleteToDo.bind(this))
        addEventListener('click', this._toggleCompleted.bind(this))
        document.querySelectorAll('#toggle-btn').forEach(filter => {
            filter.addEventListener('click',  this._filterToDo.bind(this))
        })
        document.getElementById('clear').addEventListener('click', this._clearCompleted.bind(this))

        // Drag And Drop
        document.getElementById('drag-and-drop').addEventListener('click', this._activateDragAndDrop.bind(this))
    }

    _newToDo(e){
        e.preventDefault();

        const sentence = document.getElementById('sentence')

        // Validate inputs
        if(sentence.value === '') {
            App.showError('Please enter your todo')
        } else {
            const toDo = new ToDo(sentence.value, App.checkCompleted())
            this._tracker.createTodo(toDo)
        }


        sentence.value = '';

    
        

    }

    _deleteToDo(e) {
        if (e.target.classList.contains('remove') || e.target.classList.contains('cross')){
            const id = e.target.closest('.todo-item').getAttribute('data-id');
            
            this._tracker.deleteToDo(id)

            e.target.closest('.todo-item').remove()
        }
    }

    _toggleCompleted(e){
        if (e.target.classList.contains('input-checkbox') && e.target.id !== 'checkbox-create'){
            this._tracker.toggleCompleted(e.target.id)
            e.target.nextElementSibling.classList.toggle('line-through')
        }
    }



    _searchToDos(e){
        const text = e.target.value.toLowerCase()
        document.querySelectorAll(`.todo-item`).forEach(item => {
            const name = item.firstElementChild.firstElementChild.nextElementSibling.textContent;

            if(name.toLowerCase().indexOf(text) !== -1){
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        })
    }

    _filterToDo(e) {
        const filter = [ ... document.querySelectorAll('.filter')];

        filter.forEach(f => {
           f.classList.remove('selected');
        })

        

        if (e.target.classList.contains('filter')){
            e.target.classList.toggle('selected')
            App.checkFilter(e.target.textContent)
        } else {
            document.querySelectorAll(`.todo-item`).forEach(item => {
                item.style.display = 'block'
            })
        }

    }

    _clearCompleted(){
        this._tracker.clearCompleted()

        App.checkCompletedToClear()

    }

    _activateDragAndDrop(e){

        e.target.classList.toggle('selected')

        const draggableItems = document.querySelectorAll('.checkbox-item')

        const dragListItem = document.querySelectorAll('.todo-item')

        draggableItems.forEach(item => {
            item.draggable === false ? item.draggable = true : item.draggable = false
            item.addEventListener('dragstart', this._dragStart);
        })
      
        dragListItem.forEach(item => {
          item.addEventListener('dragover', this._dragOver);
          item.addEventListener('drop', this._dragDrop);
          item.addEventListener('dragenter', this._dragEnter);
          item.addEventListener('dragleave', this._dragLeave);
        })
    }

    _dragStart() {
        dragStartIndex = this.closest('.todo-item')

        
    }

    _dragOver(e) {
        e.preventDefault(e)
    }

    _dragDrop() {
        let dragEndIndex = this.closest('.todo-item')
        App.swapItems(dragEndIndex)
    }


    static checkCompleted() {
        if (document.getElementById('checkbox-create').checked){
            return true;
        } else {
            return false
        }
    }

    static checkFilter(type) {
        document.querySelectorAll(`.todo-item`).forEach(item => {
            const checkbox = item.firstElementChild.firstElementChild;

            if(!checkbox.checked){
                type === 'Active' ? item.style.display = 'block' : item.style.display = 'none';
            } else {
                type === 'Active' ? item.style.display = 'none' : item.style.display = 'block';
            }
        })
    }

    static checkCompletedToClear() {
        document.querySelectorAll(`.todo-item`).forEach(item => {
            const checkbox = item.firstElementChild.firstElementChild;

            if(checkbox.checked){
                item.remove()
            }
        })
    }

    static showError (message) {
        
        const error = document.getElementById('error');
        error.innerText = message;

        error.style.display = 'block'

        setTimeout(() => error.style.display = 'none', 3000)
    }

    static swapItems(dragEndIndex) {

        const itemOne = dragStartIndex.firstElementChild;
        const itemTwo = dragEndIndex.firstElementChild;

        dragEndIndex.appendChild(itemOne)
        dragStartIndex.appendChild(itemTwo)
    }
    
}

class DarkModeToggle {
    constructor() {
      this.darkModeToggle = document.getElementById('mode-toggle');
      this.darkModeToggle.addEventListener('click', this._toggleMode.bind(this));
      Storage.setInitialMode();
    }
  
  
    _toggleMode() {

    const background = document.querySelector('.background');

        if(document.body.classList.contains('dark-mode')){
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            document.getElementById('light').style.display = 'none'
            document.getElementById('dark').style.display = 'block'

            window.matchMedia('only screen and (max-width: 57.5rem)').matches ?
             background.style.backgroundImage = 'url(../todo-app-main/images/bg-mobile-light.jpg)' : 
             background.style.backgroundImage = 'url(../todo-app-main/images/bg-desktop-light.jpg)';

        } else {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            document.getElementById('light').style.display = 'block'
            document.getElementById('dark').style.display = 'none'

            window.matchMedia('only screen and (max-width: 57.5rem)').matches ?
             background.style.backgroundImage = 'url(../todo-app-main/images/bg-mobile-dark.jpg)' : 
             background.style.backgroundImage = 'url(../todo-app-main/images/bg-desktop-dark.jpg)';
        }

        localStorage.setItem('isDarkMode', document.body.classList.contains('dark-mode'));
    }
  }
  
new DarkModeToggle();

let dragStartIndex;

const app = new App()