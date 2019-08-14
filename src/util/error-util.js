export const handleAxiosError = (error, context) => {
  console.error(error);

  if (error && error.response) {
    switch (error.response.status) {
      case 401:
      case 403:
        return context.$t("error.unauthorized");
      default:
        return error.message;
    }
  } else {
    return error;
  }
};
