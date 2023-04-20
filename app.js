const db = new PouchDB('income-expenses');

// Добавление новой записи в базу данных
const form = document.querySelector('#income-expenses-form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseInt(document.querySelector('#amount').value);
    const description = document.querySelector('#description').value;
    const type = document.querySelector('#type').value;

    db.put({
        _id: new Date().toISOString(),
        amount,
        description,
        type
    }).then(() => {

        updateTable();
        updateBalance();
    });
});


function getAllDocs() {
    return db.allDocs({
        include_docs: true,
        descending: true
    }).then((result) => {
        return result.rows.map((row) => row.doc);
    });
}

// Обновление таблицы с записями
function updateTable() {
    const tbody = document.querySelector('#income-expenses-table tbody');
    tbody.innerHTML = '';
    getAllDocs().then((docs) => {
        docs.forEach((doc) => {
            const row = document.createElement('tr');
            const date = new Date(doc._id).toLocaleDateString();
            row.innerHTML = `<td>${date}</td>
            <td>${doc.description}</td>
            <td>${doc.amount} руб.</td>
            <td>${doc.type === 'income' ? 'Доход' : 'Расход'}</td>
            <button class="btn-delete" id=${doc._id}>Удалить</button>
`
            tbody.appendChild(row);
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = btn.getAttribute('id');
                await deleteItem(id);
            })
        })
    });


}

// Расчет и отображение текущего баланса
function updateBalance() {
    db.allDocs({
        include_docs: true
    }).then((result) => {
        const incomes = result.rows.filter((row) => row.doc.type === 'income').reduce((total, row) => total + row.doc.amount, 0);
        const expenses = result.rows.filter((row) => row.doc.type === 'expense').reduce((total, row) => total + row.doc.amount, 0);
        const balance = incomes - expenses;
        document.querySelector('#balance').textContent = `Текущий
        баланс Артема: ${balance} руб.`;
    });
}

async function deleteItem(id) {
    console.log(1)
    db.get(id).then(function(doc) {
        return db.remove(doc);
    }).then(() => {
        updateTable();
        updateBalance();
    })

}



// Инициализация таблицы и баланса
updateTable();
updateBalance();