export const copyUrl = (appState, instanceVariables) => {
    let shareUrl = `${instanceVariables.baseURL}/#/view:annotation$annotation:${appState.annotation.id}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        window.alert(`Link to digital postcard copied to clipboard!`);
      })
      .catch(() => {
        alert("Something went wrong in copying this URL.");
      });
  }

  export const copyShareLink = (urlField, showView) => {
    urlField.select();
    urlField.setSelectionRange(0, 99999);
    let messageSuffix = showView
      ? "This link will take someone to the exact view you're looking at now."
      : "This link will take someone to the Atlascope app landing page.";
    navigator.clipboard
      .writeText(urlField.value)
      .then(() => {
        window.alert(`Link copied to clipboard! ${messageSuffix}`);
      })
      .catch(() => {
        alert("We're sorry — something went wrong in copying this URL.");
      });
  }