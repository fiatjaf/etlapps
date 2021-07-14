<script>
  export let offer
  export let voters
</script>

<article>
  <details class="accordion">
    <summary class="accordion-header">
      <i class="icon icon-arrow-right mr-1 float-right" />
      <div class="tile">
        <div class="tile-icon">
          <div class="item-tile-icon">
            <i class="icon icon-emoji centered" />
          </div>
        </div>
        <div class="tile-content">
          <p class="tile-title">{offer.head}</p>
          <p>
            <small class="tile-subtitle">
              {parseInt(offer.total / 1000)} sat |
              <span class="text-gray">{voters}</span> |
              <span class="text-gray"
                >{new Date(offer.created_at * 1000)
                  .toISOString()
                  .split('T')[0]}</span
              >
            </small>
          </p>
          <div class="accordion-body">
            <p>{offer.desc !== null ? offer.desc : ''}</p>
            <p>
              <a href="#/{offer.id}" class="btn btn-link"> OPEN </a>
            </p>
          </div>
        </div>
        <!-- <div class="tile-action">
              <i class="icon icon-arrow-right mr-1"></i>            
            </div> -->
      </div>
    </summary>
  </details>
</article>

<!-- <details class="tile accordion">
    <div class="tile-icon">
      <div class="item-tile-icon">
        <i class="icon icon-emoji centered"></i>
      </div>
    </div>
    <div class="tile-content">
        <summary>
            <p class="tile-title">{offer.head}</p>
            <small class="tile-subtitle">
                {parseInt(offer.total / 1000)} sat | 
                <span class="text-gray">{voters}</span> | 
                <span class="text-gray">{(new Date(offer.created_at * 1000)).toISOString().split('T')[0]}</span>
              </small>
        </summary>
        <div class="accordion-body">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis, sed.
        </div>        
    </div>
    <input type="radio" id={`accordion-${offer.id}`} name="accordion-radio" hidden>
    <label class='accordion-header' for={`accordion-${offer.id}`}>
            <i class="icon icon-arrow-right mr-1"></i>

    </label>
  </details> -->

<!-- <article>
    <div class="tile accordion">
        <div class="tile-icon">
          <div class="item-tile-icon">
            <i class="icon icon-emoji centered"></i>
          </div>
        </div>
        <div class="tile-content">
          <div class="tile-title">{offer.head}</div>
          <small class="tile-subtitle">
              {parseInt(offer.total / 1000)} sat | 
              <span class="text-gray">{voters}</span> | 
              <span class="text-gray">{(new Date(offer.created_at * 1000)).toISOString().split('T')[0]}</span>
              <div class="accordion-body">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Id, earum.
              </div>
            </small>
        </div>
        <div class="tile-action">
          <a href='#/{offer.id}' class="btn btn-link">
            OPEN
          </a>
        </div>
      </div>
</article> -->

<style>
  article {
    margin: 1rem auto;
    padding-top: 1rem;
    border-radius: 5px;
  }

  article:hover {
    background-color: #eff7ef;
  }

  .item-tile-icon {
    align-content: space-around;
    align-items: center;
    background: #5755d9;
    border-radius: 0.1rem;
    color: #fff;
    display: flex;
    font-size: 1.2rem;
    height: 2rem;
    width: 2rem;
  }

  .icon {
    margin: auto;
  }
</style>
