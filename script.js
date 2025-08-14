const list = document.getElementById("tasksList") // ul
const form = document.getElementById("formTask") // form
const addTaskBtn = document.getElementById("addTaskBtn")
const orderTaskBtn = document.getElementById("orderTasks")
const taskInput = document.getElementById("taskInput")
const clearTasksBtn = document.getElementById("clearTasksBtn")

taskInput.focus() // começar com foco no input

class Task{
    constructor(task){
        this.task = task
        this.state = false // para controlar o estado da tarefa
    }
}

class Modal {
    constructor() {
        this.modal = document.getElementById("modal");
        this.modalContent = document.getElementById("modalContent");
        this.modalMessage = document.getElementById("modal-message");
        this.btnClose = document.getElementById("modal-close");

        this.btnConfirm = document.createElement("button");  // Botão de confirmação
        this.btnCancel = document.createElement("button");  // Botão de cancelamento

        this.btnClose.addEventListener("click", () => this.close());
        this.btnCancel.addEventListener("click", () => this.close());

        this.btnChange = document.createElement("button")

        this.btnChange.addEventListener("click", ()=> this.executeChangeName())

        // Quando o usuário clica em "Confirmar", chamamos a função de ação
        this.btnConfirm.addEventListener("click", () => this.executeConfirmAction());

        this.inputField = document.createElement("input") // para pegar a entrada


        window.addEventListener("click", (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    open(message, onConfirmAction = null) {
        this.btnChange.style.display = "none" // garante que o btn n aparece
        this.modalMessage.textContent = message;
        this.modal.style.display = "flex";
        this.modal.classList.add("show");

        if (onConfirmAction) {
            // Guardamos a função passada para ser executada
            this.onConfirm = onConfirmAction;
            this.btnClose.style.display = "none";
            this.btnConfirm.textContent = "Confirmar";
            this.btnCancel.textContent = "Cancelar";
            this.btnConfirm.classList.add("confirm-btn");
            this.btnCancel.classList.add("cancel-btn");

            // Adiciona os botões ao modal
            this.modalContent.appendChild(this.btnConfirm);
            this.modalContent.appendChild(this.btnCancel);
        } else {
            // Se não passar a ação, mostra apenas o botão de fechar
            this.btnConfirm.remove();
            this.btnCancel.remove();
            this.btnClose.style.display = "inline-block";
        }
    }

    close() {
        this.modal.classList.remove("show");

        setTimeout(() => {
            this.modal.style.display = "none";
            // Limpa os botões após o fechamento
            this.btnConfirm.remove();
            this.btnCancel.remove();
            this.btnChange.remove();
            this.inputField.value = ""
        }, 300);
    }

    // Função para o modal de edição

    openEditModal(message, currentName, onConfirm){
        this.btnChange.style.display = "inline-block"
        this.modalMessage.textContent = message
        this.inputField.classList.add("inputNewName")
        this.inputField.value = currentName
        this.inputField.placeholder = "tarefa..."
       

        this.modal.style.display = "flex"
        this.modal.classList.add("show")

        this.btnClose.style.display = "none"; // Esconde o botão de fechar, pois vamos usar os botões personalizados
        this.btnChange.textContent = "Mudar";
        this.btnCancel.textContent = "Cancelar";
        this.btnChange.classList.add("confirm-btn"); // mesmo estilo
        this.btnCancel.classList.add("cancel-btn");

        // Adiciona o campo de input e os botões ao modal
        this.modalMessage.appendChild(this.inputField);
        this.modalContent.appendChild(this.btnChange);
        this.modalContent.appendChild(this.btnCancel);


        // Foca no campo de input
        this.inputField.focus();

        // salva o callback que será chamada ao confirmar

        this.onConfirm = onConfirm

    }

    // A função que executa a ação confirmada
    executeConfirmAction() {
        if (this.onConfirm) {  // Se houver uma ação para executar
            this.onConfirm();  // Chama a função armazenada em `this.onConfirm`
           
           
        }

        
    }

    executeChangeName(){
        const newName = this.inputField.value.trim()
        if(newName){
            this.onConfirm(newName); // chama a função de callback
            this.open("Nome alterado com sucesso!")
            
        } else{
            this.open("Nome inválido. Por favor, insira um novo nome")
        }
    }
}


const modal = new Modal()


class TaskList{
    constructor(){
        this.taskList = JSON.parse(localStorage.getItem("tasks")) || []
    }

    addTask(task){
        this.taskList.push(task)
        this.updateList() // atualizar toda vez que inserir nova
        this.saveToLocalStorage() // salvar no localStorage
    }

    sortByName(){
        this.taskList.sort((a,b)=> a.task.localeCompare(b.task))
        this.updateList()
        this.saveToLocalStorage()
    }

    clearList(){
        this.taskList = []
        this.saveToLocalStorage()
        this.updateList()
    }

    updateTaskStatus(item, li, removeBtn, changeNameBtn){
        if(item.state === true){
            li.classList.add("complete")
            removeBtn.style.display = "none"
            changeNameBtn.style.display = "none"
        }else{
            li.classList.remove("complete")
            removeBtn.style.display = "inline-block"
            changeNameBtn.style.display = "inline-block"
        }
    }

    saveToLocalStorage(){
        localStorage.setItem("tasks", JSON.stringify(this.taskList))
    }

    updateList(){
        list.innerHTML = ""

        if(this.taskList.length === 0){
            orderTaskBtn.style.display = "none"
            clearTasksBtn.style.display = "none"
        } else{
            orderTaskBtn.style.display = "inline-block"
            clearTasksBtn.style.display = "inline-block"
        }

        this.taskList.forEach((item, index)=> {
            const li = document.createElement("li")
            li.innerHTML = `<span class="task-number">Tarefa ${index+1}:</span> <span class="task-text">${item.task}</span>`;

            const buttonContainer = document.createElement("div")
            buttonContainer.classList.add("button-container")


            const removeBtn = document.createElement("button")
            removeBtn.textContent = "🗑️"
            removeBtn.classList.add("remove-btn")
            removeBtn.addEventListener("click", ()=> {
                this.taskList.splice(index, 1)
                li.remove()
                this.updateList()
                this.saveToLocalStorage()
            })

            const changeNameBtn = document.createElement("button")
            changeNameBtn.textContent = "✏️"
            changeNameBtn.classList.add("change-btn")
            changeNameBtn.addEventListener("click", ()=> {
                modal.openEditModal(
                    "Digite o novo nome para a tarefa",
                    item.task,
                    (newName)=> { // Função de callback
                        item.task = newName; // Atualiza o nome da tarefa
                        this.saveToLocalStorage()
                        this.updateList()
                    }
                )                                            
            })

            const completeBtn = document.createElement("button")
            completeBtn.textContent = "🎯"
            completeBtn.classList.add("complete-btn")
            
            completeBtn.addEventListener("click", ()=> {
                item.state = !item.state // inverte o estado
                this.saveToLocalStorage()
                this.updateTaskStatus(item, li, removeBtn, changeNameBtn)
            })
            this.updateTaskStatus(item, li, removeBtn, changeNameBtn)

            
          

            // Adicionando os botões ao container
            buttonContainer.appendChild(changeNameBtn)
            buttonContainer.appendChild(removeBtn);
            buttonContainer.appendChild(completeBtn); 
            
            // Descrição dos Botões
            completeBtn.title = "Marcar como concluida"
            removeBtn.title = "Remover tarefa"
            changeNameBtn.title = "Renomear tarefa"

            li.appendChild(buttonContainer)
            
            list.appendChild(li)

        })

    }   
}


const newTasksList = new TaskList()

newTasksList.updateList() // renderiza a lista ao carregar a página

form.addEventListener("submit", (e)=> {
    e.preventDefault()

    const nameTask = taskInput.value.trim()

    if(nameTask.length !== 0 && typeof nameTask === "string"){
        const newTask = new Task(nameTask)

        newTasksList.addTask(newTask)
        form.reset()
        taskInput.focus()
      
    } else{
       modal.open("Insira uma tarefa válida")
    }

})


orderTaskBtn.addEventListener("click", ()=> {
    newTasksList.sortByName()
    modal.open("Lista ordenada de A-Z")
})

clearTasksBtn.addEventListener("click", ()=> {
    modal.open("Tem certeza que deseja limpar a lista de tarefas?", () => {
        newTasksList.clearList();  // Ação que limpa a lista
        modal.open("A lista foi excluida com sucesso!")
       
    });

  
})

orderTaskBtn.title = "Ordem Alfabética"
clearTasksBtn.title = "Limpar lista de tarefas"
addTaskBtn.title = "Adicionar nova tarefa"



