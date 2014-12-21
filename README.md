#Crocuta
[![Build Status](https://img.shields.io/travis/doctorrustynelson/crocuta.svg)](http://travis-ci.org/doctorrustynelson/crocuta)
[![Coverage Status](http://img.shields.io/coveralls/doctorrustynelson/crocuta.svg)](https://coveralls.io/r/doctorrustynelson/crocuta)
[![NPM Version](https://img.shields.io/npm/v/crocuta.svg)](https://npmjs.org/package/crocuta)
![NPM License](https://img.shields.io/npm/l/crocuta.svg)

## Overview
  Crocuta is at its core a distributed computing system written atop the nodejs ecosystem.  This constantly evolving ecosystem of modules allows for an ever growing variety of possibilities.  The choice of this ecosystem was fueled by a desire to solve some of the frustrations that some of the major players in this field are plagued by.  Here are just some of the frustrations that this system attempt to rectify:
  
#### Just Do Something Damn It!
  It really ruins the mood when a bunch of friends decide to get together to do something and are stuck waiting for that one guy who is running really late.  This happens in computers when one aspect of a process/system/algorithm needs to wait for another process/system/algorithm to finish.  There are much better things to do then just fly around and around in a holding pattern.  One of the key aspects of nodejs is its asynchronous execution which when used properly can eliminate blocking and wasted time.  Crocuta adopted this principle and utilizes it as one of the corner stones of the system.
  
#### What Do You Mean The Wrong Version?  You've Been Running For Half an Hour!
  Dependency management in many systems is neglected because their developers don't have to deal with it when their working with the system.  They always have the right version; it's the one they are working on.  In many systems this results in very weird phenomena such as the systems crashing after running for a significant amount of time without even a hint of something wrong before crashing because a "Class" was missing. Nodejs is very fortunate to have npm which not only makes getting new libraries and tools easy but also beyond simple to manage.  Crocuta's vision explicitly aims to emulate this ease of use with dependency management.

#### One Second Let Me Check The System Specs.
  The back bone of any distributed computing system is its compute power.  For some that means specialized hardware and huge monitoring systems to keep the back end cluster running.  Taking a page out of Hadoop's book Crocuta is designed to run on as many systems (independent of complexity) as possible.  Since Crocuta is backed by nodejs and written in JavaScript it can run where ever a traditional browser can run with plans for Crocuta to close the gap between user and system by actually allowing aspects of itself to run in a traditional browser. 

## Note
  Crocuta is still in its infancy and is in a constant state of flux as it progresses through it's initial development stages.  It may be best to consider it as currently at a pre-alpha or tech-demo stage.  Use at your own discretion.

## Resources
  * [Home Page](http://doctorrustynelson.github.io/crocuta/)
  * [GitHub](https://github.com/doctorrustynelson/crocuta)
  * [Wiki](https://github.com/doctorrustynelson/crocuta/wiki)
  * [Issues](https://github.com/doctorrustynelson/crocuta/issues)
