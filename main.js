// finds elements in html by id,stored in variable to be used in JS
const bookForm = document.getElementById('bookForm');
const bookList = document.getElementById('bookList');
const colorPicker = document.getElementById('colorPicker');
const app = document.getElementById('app');
const borrowerFields = document.getElementById('borrowerFields');
const submitBtn = document.getElementById('submitBtn');
const formTitle = document.getElementById('formTitle');

let books = JSON.parse(localStorage.getItem('books')) || [];

let formMode = 'add'; // Modes: add, edit, borrow
let currentBookIndex = null;

// localStorage can only save in strings, hence JSON.parse helps to do that.
// Load saved background
const savedColor = localStorage.getItem('appColor');
if (savedColor) {
  app.style.backgroundColor = savedColor;
  colorPicker.value = savedColor;
}

displayBooks();

bookForm.addEventListener('submit', (e) => {
  e.preventDefault();  // stops the page from reloading

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const date = document.getElementById('date').value;
  const borrowerName = document.getElementById('borrowerName')?.value.trim();
  const borrowDate = document.getElementById('borrowDate')?.value;
  const borrowTime = document.getElementById('borrowTime')?.value;
  // ? only try to get this value if the element exists,and remove extra space

  if (formMode === 'add') {
    if (title && author && date) {
      books.push({ title, author, date, isAvailable: true });
    }
  } else if (formMode === 'edit' && currentBookIndex !== null) {
    books[currentBookIndex] = { ...books[currentBookIndex], title, author, date };
  } else if (formMode === 'borrow' && currentBookIndex !== null) {
    if (borrowerName && borrowDate && borrowTime) {
      books[currentBookIndex].isAvailable = false;
      books[currentBookIndex].borrower = { name: borrowerName, date: borrowDate, time: borrowTime };
    }
  }

  saveBooks();
  displayBooks();
  bookForm.reset();
  formMode = 'add';
  submitBtn.textContent = 'Add Book';
  formTitle.textContent = 'Add a Book';
  toggleBorrowerFields(false);
  currentBookIndex = null;
});

function displayBooks() {
  bookList.innerHTML = '';

  books.forEach((book, index) => {
    const statusColor = book.isAvailable ? 'green' : 'red';
    const statusText = book.isAvailable ? 'Available' : 'Borrowed';
    const borrowerInfo = book.borrower ? `${book.borrower.name} (${book.borrower.date}) (${book.borrower.time})` : '';

    // Create HTML rows dynamically for each book and show action buttons (borrow, edit, delete)
    bookList.innerHTML += `
      <tr>
        <td class="p-2">${book.title}</td>
        <td class="p-2">${book.author}</td>
        <td class="p-2">${book.date}</td>
        <td class="p-2 font-bold" style="color:${statusColor}">${statusText}</td>
        <td class="p-2">${borrowerInfo}</td>
        <td class="p-2 space-x-1">
          <button onclick="borrowBook(${index})" class="bg-blue-500 text-white px-2 py-1 rounded">
            ${book.isAvailable ? 'Borrow' : 'Return'}
          </button>
          <button onclick="editBook(${index})" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
          <button onclick="deleteBook(${index})" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
        </td>
      </tr>
      
    `;
  });
}

function borrowBook(index) {
  // If book is available, switch to borrow mode, show fields, and get ready to submit borrow info
  if (books[index].isAvailable) {
    const book = books[index];
    document.getElementById('title').value = book.title;
    document.getElementById('author').value = book.author;
    document.getElementById('date').value = book.date;
    formMode = 'borrow';
    currentBookIndex = index;
    submitBtn.textContent = 'Confirm Borrow';
    formTitle.textContent = 'Borrow Book';
    toggleBorrowerFields(true);

  } else {
    books[index].isAvailable = true;
    delete books[index].borrower;
    saveBooks();
    displayBooks();
  }
}
// Loads the book into the form so user can edit it.Switch to 'edit' mode.
function editBook(index) {
  const book = books[index];
  document.getElementById('title').value = book.title;
  document.getElementById('author').value = book.author;
  document.getElementById('date').value = book.date;

  formMode = 'edit';
  currentBookIndex = index;
  submitBtn.textContent = 'Update Book';
  formTitle.textContent = 'Edit Book';
  toggleBorrowerFields(false);
}

function deleteBook(index) {
  if (confirm("Are you sure you want to delete this book?")) {
    books.splice(index, 1);
    saveBooks();
    displayBooks();
  }
}

// Simple show/hide logic. If show is true, show borrower fields. If not, hide them.
function toggleBorrowerFields(show) {
  borrowerFields.style.display = show ? 'block' : 'none';
}
// turns the books array into a string so it can be saved
function saveBooks() {
  localStorage.setItem('books', JSON.stringify(books));
}

// When the color picker changes, update the background and save it in localStorage.
colorPicker.addEventListener('input', (e) => {
  const color = e.target.value;
  app.style.backgroundColor = color;
  localStorage.setItem('appColor', color);
});
