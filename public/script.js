const allimages=document.querySelector('.image');
const next=document.querySelector('.next');
const prev=document.querySelector('.prev');
var num=0;
const url=[
    "https://cdn.shopify.com/s/files/1/0057/8938/4802/files/Collection-Banner_346efdc6-82b3-4370-87b9-e018fe298c09_2000x.jpg?v=1658677055",
    "https://cdn.shopify.com/s/files/1/0057/8938/4802/files/A121-website-banner_2000x.jpg?v=1658560096",
    "https://cdn.shopify.com/s/files/1/0057/8938/4802/files/banner-web_2000x.jpg?v=1659119373"];
next.addEventListener('click',()=>{
    goToSlideN();
    clearInterval(slideInterval);
})
prev.addEventListener('click',()=>{
    goToSlideP();
    clearInterval(slideInterval1);
})
function goToSlideN()
{
    num++;
    if(num==url.length)
    {
        num=0;
    }
    allimages.innerHTML='<img src='+url[num]+'class="image" id="im"></img>';
}
function goToSlideP()
{
    num--;
    if(num<0)
    {
        num=url.length-1;
    }
    allimages.innerHTML='<img src='+url[num]+'class="image" id="im"></img>';
}
const slideInterval = setInterval(() => {
    goToSlideN();
  }, 3000);
  const slideInterval1 = setInterval(() => {
    goToSlideP();
  }, 3000);
