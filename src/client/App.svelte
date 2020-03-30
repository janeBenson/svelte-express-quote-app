<script>
	import { Router, Link, Route, links } from "svelte-routing";
	
	import AddQuote from './routes/AddQuote.svelte'
	import Home from './routes/Home.svelte'
	import NavBar from './components/NavBar.svelte'
	import PageHeader from './components/PageHeader.svelte'

</script>

<style>
	:global(body) {
		color: #717070;
	}

	:global(a:hover, a:visited, a:link, a:active) {
		text-decoration: none;
	}
	
</style>

<svelte:head>
	<!-- Font Awesome -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

	<!-- Bootstrap 4-->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
	<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
	
	<title>Quotes</title>
</svelte:head>

<div use:links>
<Router>
	<div class="container">

		<PageHeader />

		<NavBar />

		<Route path="/"><Home /></Route>
	
		<Route path="add"><AddQuote /></Route>

	</div>
	</Router>
</div>

