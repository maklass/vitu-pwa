export const handleAxiosError = (error, context) => {
  console.error(error);

  if (error && error.response) {
    if (error.response.data && error.response.data.issue && error.response.data.issue.length) {
      return error.response.data.issue.reduce((acc, current, index) => acc + (index + 1) + ". " + current.diagnostics, "");
    }

    switch (error.response.status) {
      case 401:
        return context.$t("error.unauthorized");
      case 403:
        return context.$t("error.unauthorized");
      default:
        return error.message;
    }
  } else {
    return error;
  }
};
