const state = { data: null };

const loadData = async () => {
  $('#status').text('加载中...').show();
  try {
    const response = await fetch('data/tithe.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (data.regions.length === 0) {
      $('#status').text('暂无数据').show();
      return;
    }
    state.data = data;
    $('#sub-title').text(data.title + ' · 数据来源：' + data.source);
    $('#status').hide();
    renderCards(data);
  } catch (error) {
    $('#status').text('加载失败：' + error.message).show();
  }
};

const renderCards = (data) => {
  const years = data.years;
  const unit = data.unit;
  data.regions.forEach(r => {
    const total = r.amounts.reduce((sum, n) => sum + n, 0);
    $('#cards').append(`
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title h6">${r.name}</h3>
            <p class="card-text fs-4">${total}</p>
            <p class="card-text small text-muted">共${years.length}年累计（${unit}）</p>
          </div>
        </div>
      </div>
    `);
  });
};

loadData();
