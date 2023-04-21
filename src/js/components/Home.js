import {select, templates} from '../settings.js';



class Home {
  constructor(homeContainer){


    this.render(homeContainer);


  }

  render(homeContainer){


    this.dom = {};
    this.dom.wrapper = homeContainer;

    this.dom.wrapper.innerHTML = templates.homeWidget();

    this.dom.linkImage = this.dom.wrapper.querySelectorAll(select.home.linkImage);

  }


}

export default Home;