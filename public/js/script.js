/*==========*
 *  ready   *
 *==========*/
$(document).ready(function () {
    menuClick()
    if (localStorage.dark == "true")
        $('body').addClass("dark")
    $('[data-dark]').click(function () {
        let isDark = $('body').hasClass("dark")
        if (isDark) {
            $('body').removeClass("dark")
            localStorage.dark = "false"
        } else {
            $('body').addClass("dark")
            localStorage.dark = "true"
        }
    })
});
/*==========*
 *    Vue   *
 *==========*/
Vue.component('sortButton', {
    data: function () {
        return {
            sort: localStorage.sortPost || 'A-Z'
        }
    },
    template: `<div class="ts icon circular buttons">
    <button class="ts button" @click="changeSort('A-Z');" :class="{active:sort=='A-Z'}">
        <i class="sort alphabet descending icon"></i>
    </button>
    <button class="ts button" @click="changeSort('Z-A')" :class="{active:sort=='Z-A'}">
        <i class="sort alphabet ascending icon"></i>
    </button>
    <button class="ts button" @click="changeSort('time')" :class="{active:sort=='time'}">
        <i class="icons">
            <i class="clock icon"></i>
            <i class="sort descending corner icon"></i>
        </i>
    </button>
    <button class="ts button" @click="changeSort('timeReverse')" :class="{active:sort=='timeReverse'}">
        <i class="icons">
            <i class="clock icon"></i>
            <i class="sort ascending corner icon"></i>
        </i>
    </button>
    </div>`,
    methods: {
        changeSort(s) {
            this.sort = s
            localStorage.sortPost = s
            this.$emit('sort', s)
        }
    }
})
Vue.component('loadingBox', {
    template: `<div class="ts active centered inline loader"></div>`
})
Vue.component('posts', {
    props: ['posts', 'pagination', 'page'],
    data() {
        return {
            postsPerPage: 24
        }
    },
    template: `<div>
        <div class="ts stackable grid pageinfo" style="margin-bottom:15px;">
            <div class="stretched column">
                <h3 class="ts header pagetitle" v-if="pagination">第 {{page}} 頁，共 {{Math.ceil(posts.length / postsPerPage)}} 頁</h3>
                <h3 class="ts header pagetitle" v-else>{{posts.length}} 個搜尋結果</h3>
            </div>
            <div class="column" style="text-align:right;">
                <sortButton @sort="onSort"></sortButton>
            </div>
        </div>
        <div class="ts divider"></div>
        <div class="ts stackable three cards posts" v-if="pagination">
            <post-card v-for="post in posts.slice((page - 1) * postsPerPage, page * postsPerPage)" :key="post.link" :post="post"></post-card>
        </div>
        <div class="ts stackable three cards posts" v-else>
            <post-card v-for="post in posts" :key="post.link" :post="post"></post-card>
        </div>
        <div class="pagination" v-if="pagination">
            <router-link v-for="i in Math.ceil(posts.length / postsPerPage)" :key="i" :to="'/posts/'+i" class="ts circular button" activeClass="active">{{ i }}</router-link>
        </div>
    </div>`,
    created() {
        this.onSort()
    },
    methods: {
        onSort() {
            switch (localStorage.sortPost) {
                case "Z-A":
                    this.posts.sort((a, b) => (b.title).localeCompare(a.title, "zh-Hant"))
                    break;
                case "time":
                    this.posts.sort((a, b) => new Date(b.time) - new Date(a.time))
                    break;
                case "timeReverse":
                    this.posts.sort((a, b) => new Date(a.time) - new Date(b.time))
                    break;
                default: //a-z
                    this.posts.sort((a, b) => (a.title).localeCompare(b.title, "zh-Hant"))
            }
        }
    }
})
Vue.component('post-card', {
    props: ['post'],
    template: `<router-link class="ts card" :to="'/post/'+post.link">
        <div class="content">
            <div class="header">{{ post.title }}</div>
            <div class="description">{{ post.summary }}</div>
        </div>
    </router-link>`
})
Vue.component('searchBox', {
    data() {
        return {
            keyword: this.$route.params.keyword
        }
    },
    template: `<form class="ts very narrow container" @submit.prevent="onSubmit">
        <div class="ts action fluid input" id="searchbox">
            <input id="search" 
                placeholder="輸入關鍵字來搜尋" 
                type="text" 
                v-model.trim="keyword">
            <button class="ts button" type="submit">搜尋</button>
        </div>
    </form>`,
    methods: {
        onSubmit() {
            if (this.keyword == "" || !this.keyword) {
                swal({
                    title: "錯誤",
                    text: "請輸入關鍵字",
                    icon: "error",
                })
            } else {
                router.push({
                    name: 'search',
                    params: {
                        keyword: this.keyword
                    }
                })
                this.$emit('search', this.keyword)
            }
        }
    }
})
Vue.component('searchResult', {
    data() {
        return {
            posts: null,
        }
    },
    created() {
        this.fetchData()
    },
    template: `<div><searchBox @search="fetchData"></searchBox><posts :posts="posts" v-if="posts" :pagination="false"></posts><loadingBox v-else></loadingBox></div>`,
    methods: {
        fetchData() {
            this.posts = null
            fetch(`/mdr/search/${this.$route.params.keyword}`)
                .then(response => response.json())
                .then(d => this.posts = d)
        }
    }
})
Vue.component('home', {
    data() {
        return {
            posts: null
        }
    },
    created() {
        this.fetchData()
    },
    template: `<div><posts :posts="posts" v-if="posts" :pagination="true" :page="Number($route.params.page)"></posts><loadingBox v-else></loadingBox></div>`,
    methods: {
        fetchData() {
            fetch(`/mdr/posts`)
                .then(response => response.json())
                .then(d => this.posts = d)
        }
    }
})

Vue.component('post', {
    created() {
        this.fetchData()
    },
    data() {
        return {
            post: null,
            time: null
        }
    },
    template: `
        <div>
            <div v-if="post">
                <h2 class="ts header">
                    <i class="file text outline icon"></i>
                    <div class="content">
                        {{post.title}}
                        <div class="sub header">
                            {{time}}
                            {{size}}
                        </div>
                    </div>
                </h2>
                <div class="ts divider"></div>
                <div id="content" v-html="post.content">找不到這個檔案</div>
                <div class="ts horizontal divider">本文結束</div>
            </div>
            <loadingBox v-else></loadingBox>
        </div>`,
    methods: {
        fetchData() {
            fetch(`/mdr/post/${this.$route.params.filename}`)
                .then(response => response.json())
                .then(d => {
                    function readablizeBytes(bytes) {
                        var s = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
                        var e = Math.floor(Math.log(bytes) / Math.log(1024));
                        return (bytes / Math.pow(1024, Math.floor(e))).toFixed(2) + s[e];
                    }
                    this.post = d
                    this.time = moment(d.stat.mtime).format("YYYY/MM/DD HH:MM:SS")
                    this.size = readablizeBytes(d.stat.size)
                })
        }
    }
})

const router = new VueRouter({
    mode: 'history',
    scrollBehavior(to, from, savedPosition) {
        return savedPosition || {
            x: 0,
            y: 0
        }
    },
    routes: [{
        path: '/search',
        component: {
            template: `<searchBox></searchBox>`
        }
    }, {
        path: '/search/:keyword',
        name: 'search',
        component: {
            template: `<div><searchResult></searchResult></div>`
        },
        props: true
    }, {
        path: '/post/:filename',
        component: {
            template: `<post></post>`
        },
        props: true
    }, {
        path: '/posts/:page',
        name: 'posts',
        component: {
            template: `<home></home>`
        },
        props: true
    }, {
        path: '/',
        redirect: '/posts/1'
    }]
})
const app = new Vue({
    router
}).$mount('#app')


/*==========*
 * scrollspy*
 *==========*/
$(window).scroll(function () {
    scrollspy()
});

function menuClick() {
    $('#menu .button').click(function () {
        if ($(this).attr('data-scroll') == 'N/A') return
        $('html,body').animate({
            scrollTop: $(this).attr('data-scroll') - 60
        }, 200);
    });
}

function scrollspy() {
    let chapter = $('#content h1,#content h2,#content h3,#content h4,#content h5,#content h6')
    if ($(window).scrollTop() - 80 > $('.ts.container').offset().top && chapter.length > 0) {
        $('#menu').addClass('show')
    } else {
        $('#menu').removeClass('show');
        return;
    }

    // Get container scroll position
    let fromTop = $(window).scrollTop();
    let previousChapter, nowChapter, nextChapter
    for (let i = 0; i < chapter.length; i++) {
        if ($(chapter[i]).offset().top < fromTop + 61) {
            previousChapter = $(chapter[i - 1])
            nowChapter = $(chapter[i])
            nextChapter = $(chapter[i + 1])
        }
    }
    if (nowChapter && $('#menu .nowChapter').attr('data-scroll') != nowChapter.offset().top) {
        if (previousChapter.length != 0 && $('#menu .nowChapter').attr('data-scroll') == previousChapter.offset().top) {
            $('#menu').addClass('toNext')
        }
        if (nextChapter.length != 0 && $('#menu .nowChapter').attr('data-scroll') == nextChapter.offset().top) {
            $('#menu').addClass('toPrevious')
        }
        $('#menu').addClass('changeing')
        setTimeout(function () {
            $('#menu').removeClass('changeing toNext toPrevious')
        }, 200 + 1);
    }

    if (!previousChapter || previousChapter.length == 0)
        $('#menu .previousChapter').text('-').attr('data-scroll', 'N/A')
    else
        $('#menu .previousChapter').text(previousChapter.text()).attr('data-scroll', previousChapter.offset().top);

    if (!nowChapter || nowChapter.length == 0)
        $('#menu .nowChapter').text('-').attr('data-scroll', 'N/A')
    else
        $('#menu .nowChapter').text(nowChapter.text()).attr('data-scroll', nowChapter.offset().top)

    if (!nextChapter || nextChapter.length == 0)
        $('#menu .nextChapter').text('-').attr('data-scroll', 'N/A')
    else
        $('#menu .nextChapter').text(nextChapter.text()).attr('data-scroll', nextChapter.offset().top)
}