import React, { useEffect, useState } from "react";
import axios from "axios";
import { connect } from "react-redux";
import { getSearchResults } from "../../store/search.js";
import Typography from "@material-ui/core/Typography";
import _ from 'lodash';

import API from '../../constants/url.js';
import { updateCookbook } from "../../store/userReducer.js";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Collapse from "@material-ui/core/Collapse";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import { orange } from "@material-ui/core/colors";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ShareIcon from "@material-ui/icons/Share";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Container from "@material-ui/core/Container";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import '../../App.css';

// import Link from "@material-ui/core/Link";
// import Grid from "@material-ui/core/Grid";
// import Paper from "@material-ui/core/Paper";


/*
Ingredients, picture, title, 
When someone clicks expand
Make a get request to recipe API using the id to retireve directions(instructions) and cook time
*/





const useStyles = makeStyles((theme) => ({
    root: {
        [theme.breakpoints.down('sm')]:{
        maxWidth: 345,    
        },
        [theme.breakpoints.down('md')]:{
            maxWidth: 500,
        },
        [theme.breakpoints.down('lg')]:{
            maxWidth: 700,
        }, 
    },
    media: {
        height: 0,
        paddingTop: "56.25%", // 16:9
    },
    expand: {
        transform: "rotate(0deg)",
        marginLeft: "auto",
        transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: "rotate(180deg)",
    },
    avatar: {
        backgroundColor: orange[500],
    },
    paper: {
        padding: theme.spacing(2),
        margin: "auto",
        maxWidth: 1000,
    },
}));
// require('dotenv').config({ path: '../../.env'});

// router.get('/searchByCuisine', searchByCuisine);router.get('/searchByIngredients', searchByIngredients);


function SearchForm({ results, currentBook, updateCookbook, currentUser }) {

    const classes = useStyles();

    const [expanded, setExpanded] = useState(false);
    const [directions, setDirections] = useState('');
    const [liked, setLiked] = useState(true);
    const [cookbook, setCookbook] = useState(currentBook)

    const handleExpandClick = (id) => {
        setExpanded(!expanded);

    };

    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        getSearchResults([]);
    }, [getSearchResults]);

    const [searchValue, setSearchValue] = useState("");

    const handleSearchInputChange = (e) => {
        setSearchValue(e.target.value);
    };

    const resetSearchField = () => {
        setSearchValue("");
    };


    const likeHandler = async (recipe) => {
        console.log('this is the recipe', recipe)


        let likeBeforeStatus = false;
        let index;
        let bestRecipe = recipe.analyzedInstructions[0].steps.map( item => item.step)
        let recipeFromAPI = {
            author: recipe.sourceName,
            sourceUrl:recipe.sourceUrl,
            recipeName: recipe.title,
            thumbnail: recipe.image,
            prepTime: recipe.readyInMinutes,
            ingredients: recipe.extendedIngredients.original ? recipe.extendedIngredients.original : recipe.extendedIngredients.originalString,
            directions: bestRecipe
        };

        for (let i = 0; i < cookbook.length; i++) {
            if (cookbook[i].recipeName === recipe.title) {
                likeBeforeStatus = true;
                index = i;
            };
        }

        if (likeBeforeStatus) {
            cookbook.splice(index, 1);
        } else {
            cookbook.push(recipeFromAPI);
        }
        console.log('this is liked before set liked', liked)
        setLiked(!liked);
        updateCookbook(cookbook);
        console.log('this is liked after set liked ', liked)
        

        let url = API.BASE + API.COOKBOOK + currentUser.profile.id

        await axios.put(url, { data: cookbook })



    }

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        const query = {
            ingredients: searchValue,
            cuisine: searchValue,
        };

        let results = await axios.get(
            `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query.ingredients}&apiKey=1b88e455beea4cfdb41c5ac979d25fee&addRecipeInformation=true&instructionsRequired=true`
        );
        // TODO: IS MAKE IT SO YOU CAN SEARCH BY CUISINE
        // Make the results saveable
        // PUT API KEY INTO DOTENV


        let recipeIds = [];
        await results.data.map(recipe => recipeIds.push(recipe.id))
        let ids = recipeIds.toString();
        let recipesWithDirections = await axios.get(`https://api.spoonacular.com/recipes/informationBulk?ids=${ids}&includeInstruction=true&apiKey=1b88e455beea4cfdb41c5ac979d25fee`)


        setSearchResults(recipesWithDirections.data);
        console.log("RRRResults", searchResults)
        resetSearchField();
    };


    return (
        <Container maxWidth="sm" className="container">
            <div className={classes.root}>
                <Card className={classes.root} style={{ backgroundColor: 'orange' }}>
                    <form>
                        <h2>Search for a Recipe</h2>
                        <TextField id="standard-basic"
                            type="text"
                            placeholder="search by ingredients"
                            onChange={handleSearchInputChange}
                        />
                        <br /><br />
                                <Button variant="contained" onClick={handleSearchSubmit} type="submit">
                            Go!
                </Button>

                    </form>
                    <br />
                </Card>

                <div>

                    {searchResults.map((recipe) => (

                        <Card key={Math.random()}>
                            <CardHeader
                                avatar={
                                    <Avatar aria-label="recipe" className={classes.avatar}>
                                        R
                        </Avatar>
                                }
                                title={recipe.title}

                            />

                            <CardMedia
                                className={classes.media}
                                image={recipe.image}
                                // image={recipe.thumbnail}
                                title={recipe.recipeName}
                            />

                            <CardContent>

                                <h3><a href={recipe.sourceUrl}>
                                    Source: {recipe.sourceName}</a></h3>


                            </CardContent>
                            {console.log('------------- this is the cookbook', cookbook)}
                            <CardActions disableSpacing>

                                <IconButton  
                                onClick={() => { likeHandler(recipe) }}
                                aria-label="add to favorites"
                                color={_.find(cookbook, recipe) ? "secondary": 'primary'}
                                
                                 >

                                    <FavoriteIcon />
                                </IconButton>
                                <IconButton aria-label="share">
                                    <ShareIcon />
                                </IconButton>
                                <IconButton
                                    className={clsx(classes.expand, {
                                        [classes.expandOpen]: expanded,
                                    })}
                                    onClick={handleExpandClick}
                                    aria-expanded={expanded}
                                    aria-label="show more"
                                >
                                    <ExpandMoreIcon />
                                </IconButton>
                    </CardActions>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                                <CardContent>
                                    <Typography variant="subtitle1">
                                        <h3>Time:</h3>{recipe.readyInMinutes} minutes
                    </Typography>
                                    <Typography variant='h6'><h3>Ingredients:</h3></Typography>
                                    {recipe.extendedIngredients.map((item) => (
                                        <Typography key={Math.random()} paragraph>{item.original}</Typography>
                                    ))}

                                    <Typography variant='h6'><h3>Directions:</h3></Typography>
                                    {recipe.analyzedInstructions.length === 0 ?
                                        <Typography>{recipe.instructions}</Typography> : recipe.analyzedInstructions[0].steps.map((step) => 
                                            <Typography key={Math.random()} paragraph>{JSON.stringify(step.number), ' ', step.step}</Typography>
                                        )}
                                </CardContent>
                            </Collapse>
                        </Card>
                    ))}
                </div>
            </div>
        </Container>
    );
}

const mapStateToProps = (state) => {
    return {
        results: state.searchReducer.results,
        id: state.searchReducer.results.id,

        currentUser: state.userReducer.user,

        currentBook: state.userReducer.cookbook,
    };
};
const mapDispatchToProps = { getSearchResults, updateCookbook};

export default connect(mapStateToProps, mapDispatchToProps)(SearchForm);