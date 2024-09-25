export const sort = {
  byDescending: (selector) => {
    return (left, right) => {
      const l = selector(left), r = selector(right);

      return r < l ? -1 : r > l ? 1 : 0;
    };
  }
};