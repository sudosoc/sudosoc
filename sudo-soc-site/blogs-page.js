const blogData = [
  {
    title: "Blog Title 1",
    description: "This is a detailed description for Blog 1...",
    link: "full-blog1.html"
  },
  {
    title: "Blog Title 2",
    description: "This is a detailed description for Blog 2...",
    link: "full-blog2.html"
  },
  {
    title: "Blog Title 3",
    description: "This is a detailed description for Blog 3...",
    link: "full-blog3.html"
  },
  {
    title: "Blog Title 4",
    description: "This is a detailed description for Blog 4...",
    link: "full-blog4.html"
  },
  {
    title: "Blog Title 5",
    description: "This is a detailed description for Blog 5...",
    link: "full-blog5.html"
  },
  {
    title: "Blog Title 6",
    description: "This is a detailed description for Blog 6...",
    link: "full-blog6.html"
  },
  {
    title: "Blog Title 7",
    description: "This is a detailed description for Blog 7...",
    link: "full-blog7.html"
  },
  {
    title: "Blog Title 8",
    description: "This is a detailed description for Blog 8...",
    link: "full-blog8.html"
  }
];

function openPopup(index) {
  const popup = document.getElementById("popup");
  const title = document.getElementById("popup-title");
  const desc = document.getElementById("popup-description");
  const readMore = document.getElementById("read-more-link");

  title.textContent = blogData[index].title;
  desc.textContent = blogData[index].description;
  readMore.href = blogData[index].link;

  popup.style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}
