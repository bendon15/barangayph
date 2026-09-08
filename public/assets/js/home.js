(async function () {
  const info = await Api.getBarangayInfo();
  document.getElementById('statHouseholds').textContent = (info.household_count || 0).toLocaleString();
  document.getElementById('statPopulation').textContent = (info.population || 0).toLocaleString();
  document.getElementById('statPurok').textContent = info.purok_count || 0;

  await SiteRender.renderServiceCards(document.getElementById('servicesPreview'), { limit: 3 });
  await SiteRender.renderAnnouncementList(document.getElementById('announcementPreview'), { limit: 3 });
  await SiteRender.renderChairmanCard(document.getElementById('chairmanPreview'));
})();
