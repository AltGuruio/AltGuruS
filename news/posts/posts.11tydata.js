module.exports = {
  eleventyComputed: {
    dateISO: (data) => {
      const raw = data.date ?? data.page?.date;
      if (!raw) return "";
      const d = raw instanceof Date ? raw : new Date(raw);
      return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    },
    dateHuman: (data) => {
      const raw = data.date ?? data.page?.date;
      if (!raw) return "";
      const d = raw instanceof Date ? raw : new Date(raw);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    },
  },
};
