import React from 'react';
import { Button, Form, FormGroup, Label, Input, FormText, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle } from 'reactstrap';


class ValidateSubscription extends React.Component {
    render() {
        return (
            <Card style={{padding: '20px', margin:'auto', maxHeight:'50vh', maxWidth:'50vw'}}>
                <h1 ><b> Validate Subscription </b></h1>
                <Form>
                    <FormGroup>
                        <Label for="Check Subscription">Name</Label>
                        <br/>
                        <Button>Check Subscription</Button>
                    </FormGroup>
                </Form>
                <br/><br/><hr/>

                <h1 ><b> Verify your Subscription </b></h1>
                <Form>
                    <FormGroup>
                        <Label for="Symbol">Symbol</Label>
                        <Input type="text" name="proof" id="proof" placeholder="Enter your proof here" />
                    </FormGroup>
                    <Button>Verify</Button>
                </Form>
            </Card>
        )
    }

}

export default ValidateSubscription;
