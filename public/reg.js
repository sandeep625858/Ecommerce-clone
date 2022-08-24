    const password=$('#pass').val();
    const Conpassword=$('#Repeat').val();
    $('#btn').click((e)=>{
        if(password!=Conpassword){
            alert("Confirm Password has to be same as Password");
            e.preventDefault();
        }
    })