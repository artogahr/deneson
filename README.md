# deneson

A nested text parser made to run with Deno, outputs JSON. It's not a generic algorithm, it's only made to parse the example output given in the ipVirtualStaticLab3 file. 

##### In the beginning the Universe was created.

Later that day, God asked its subject to select a JavaScript runtime, main
selections being Node and Deno.

Let's take a look at the main pros:

- Node
  - Works
  - Has a huge ecosystem catered to it
  - Everyone uses and knows about it

- Deno
  - Written in Rust

The Choice was clear.

---
Jokes aside, this was harder than I thought. What I ended up writing is basically a glorified state machine, but in retrospect, is it even possible to write a CLI output parser without making it a state machine?

I abuse the regularity of the output a lot. For example, I assume the output is divided into sections separated by two newlines. Then I go through each section, checking the first line to figure out what it's supposed to be. 

The first thing that comes to mind when writing a parser for this is keeping track of how many spaces "in" the current line is, to keep track of the indentation, to figure out what level of nesting the JSON data should be in. However I don't do this, I make the assumption that sub-sections of the sections will be regular, and I keep the relevant state I'm in with a variable. For the small output I'm working with this is fine, but for larger projects it might get too tedious. But then again, this approach seems more robust to me. 

There are some sprinkles of algorithms thrown in there like converting an IP address string to an integer, or converting between speed units to bits per second. Otherwise, the program is mostly if statements. 

I did use tools such as ChatGPT for this one, but mostly for questions regarding TypeScript's intricacies, since it's my first time working with it. I'm still an advocate for manual searching for learning purposes. 
