// ==UserScript==
// @name BetterFeed
// @namespace https://github.com/davidmz/BetterFeed
// @version 1.0.1
// @description Some cool features for FreeFeed
// @include https://freefeed.net/*
// @include https://micropeppa.freefeed.net/*
// ==/UserScript==
!function(e){function t(a){if(n[a])return n[a].exports;var r=n[a]={exports:{},id:a,loaded:!1};return e[a].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){!function(){var e=null,t=0,n=Date.now(),a=localStorage,r=parseInt,o="be-fe-version",s="be-fe-next-update",p=function(e){var t=document.createElement("script");t.src="https://cdn.rawgit.com/davidmz/BetterFeed/"+e+"/build/better-feed.min.js",t.type="text/javascript",t.charset="utf-8",t.async=!0,document.head.appendChild(t)};if(o in a&&(e=a[o],t=r(a[s]),isNaN(t)&&(t=0)),n>t){a[s]=n+36e5;var i=new XMLHttpRequest;i.open("GET","https://api.github.com/repos/davidmz/BetterFeed/tags?page=1&&per_page=1"),i.responseType="json",i.onload=function(){var t=this.response;1==t.length&&"name"in t[0]&&(a[o]=t[0].name,a[s]=n+864e5,null===e&&p(t[0].name))},i.send()}null!==e&&p(e)}()}]);