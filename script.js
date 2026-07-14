function openInvitation() {
  document.getElementById('page1').classList.remove('active');
  document.getElementById('page2').classList.add('active');
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('sealArea').addEventListener('click', openInvitation);
  document.getElementById('textArea').addEventListener('click', openInvitation);
});
