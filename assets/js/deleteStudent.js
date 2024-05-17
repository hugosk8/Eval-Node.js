document.addEventListener("DOMContentLoaded", () => {
    const deleteButton = document.getElementsByClassName('delete-button');
    
    Array.from(deleteButton).forEach(button => {
        button.addEventListener("click", async (e) => {
            const studentItem = e.target.closest('li');
            const studentName = studentItem.querySelector('h2').innerText;
            const response = await fetch(`/studentsList/${studentName}`, {
                method: "DELETE"
            });
            
            if (response.ok) {
                studentItem.remove();
            } else {
                console.error("Failed to delete student");
            }
        })
    });
})