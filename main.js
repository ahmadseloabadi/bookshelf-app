const STORAGE_KEY = "BOOKSHELF_APPS";
const RENDER_EVENT = "render-books";
const books = [];

function generateId() {
  return Number(new Date());
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const bookContainer = document.createElement("div");
  bookContainer.classList.add("book_item");
  bookContainer.setAttribute("data-testid", "bookItem");
  bookContainer.setAttribute("data-bookid", id);

  const textTitle = document.createElement("h3");
  textTitle.setAttribute("data-testid", "bookItemTitle");
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.setAttribute("data-testid", "bookItemAuthor");
  textAuthor.innerText = `Penulis: ${author}`;

  const textYear = document.createElement("p");
  textYear.setAttribute("data-testid", "bookItemYear");
  textYear.innerText = `Tahun: ${year}`;

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action");

  const toggleButton = document.createElement("button");
  toggleButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  toggleButton.innerText = isComplete
    ? "Belum selesai dibaca"
    : "Selesai dibaca";
  toggleButton.classList.add("green");

  toggleButton.addEventListener("click", function () {
    toggleBookStatus(id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.innerText = "Hapus buku";
  deleteButton.classList.add("red");

  deleteButton.addEventListener("click", function () {
    removeBook(id);
  });

  const editButton = document.createElement("button");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.innerText = "Edit buku";
  editButton.classList.add("blue");

  actionContainer.append(toggleButton, deleteButton, editButton);
  bookContainer.append(textTitle, textAuthor, textYear, actionContainer);

  return bookContainer;
}

function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = parseInt(document.getElementById("inputBookYear").value);
  const isComplete = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    title,
    author,
    year,
    isComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function toggleBookStatus(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = !bookTarget.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function searchBook(keyword) {
  const bookList = document.querySelectorAll('[data-testid="bookItem"]');

  for (const book of bookList) {
    const title = book
      .querySelector('[data-testid="bookItemTitle"]')
      .innerText.toLowerCase();
    if (title.includes(keyword.toLowerCase())) {
      book.style.display = "";
    } else {
      book.style.display = "none";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  const searchForm = document.getElementById("searchBook");
  const inputBookIsComplete = document.getElementById("inputBookIsComplete");
  const bookSubmitButton = document.getElementById("bookSubmit");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    submitForm.reset();
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const keyword = document.getElementById("searchBookTitle").value;
    searchBook(keyword);
  });

  inputBookIsComplete.addEventListener("change", function () {
    const buttonSpan = bookSubmitButton.querySelector("span");
    buttonSpan.innerText = inputBookIsComplete.checked
      ? "Selesai dibaca"
      : "Belum selesai dibaca";
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const incompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completedBookList = document.getElementById("completeBookshelfList");

  incompletedBookList.innerHTML = "";
  completedBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      incompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});
