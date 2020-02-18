/** @format */

export function makeSnippet(bannerId, width, height) {
  return `
<style>
#banner-ad-banner {
  display: flex;
  justify-content: center;
  align-items: center;
  border-style: solid;
  border-width: 4px;
  padding: 2px 4px;
  text-decoration: none;
  position: relative;
}
#banner-ad-banner::before {
  content: 'advertisement';
  background-color: white;
  padding: 4px;
  position: absolute;
  left: 0;
  top: -14px;
  right: 0;
  margin: 0 auto;
  display: inline-block;
  width: 140px;
}
</style>
<script id="banner-ad">
fetch(
  "https://etleneum.com/~/contract/cko001spd3/state/.current_ads.${bannerId}"
)
  .then(r => r.json())
  .then(({value: ad}) => {
    let a = document.createElement('a')
    let s = document.getElementById('banner-ad')
    s.parentNode.insertBefore(a, s)
    a.id = 'banner-ad-banner'
    a.style.width = "${width}px"
    a.style.height = "${height}px"

    if (!ad) {
      a.href = "https://banners.etleneum.com/#/${bannerId}"
      a.innerHTML = placeholder
      return
    }

    let {text, image_url, link} = ad
    a.href = link
    if (image_url) {
      let c = document.createElement('img')
      c.src = image_url
      a.appendChild(c)
    } else {
      a.innerText = text
      a.style.display = 'flex'
      a.style.justifyContent = 'center'
      a.style.alignItems = 'center'
    }
  })
</script>
`
}
