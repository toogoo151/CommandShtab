    {{-- @extends('layouts.app')
    @section('content') --}}
    <!DOCTYPE html>
    <html lang="en">

    <head>
        {{--
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> --}}
        {{--
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital@1&display=swap" rel="stylesheet"> --}}
        {{--
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"> --}}
        {{--
        <link rel="dns-prefetch" href="//fonts.gstatic.com"> --}}


        {{--
        <script src="https://kit.fontawesome.com/a81368914c.js" crossorigin="anonymous"></script> --}}

        <!--Zagvarlag alert-->
        <link rel="stylesheet" href="{{ asset('/z-alert/css/alertify.core.css') }}" />
        <link rel="stylesheet" href="{{ asset('/z-alert/css/alertify.default.css') }}" />
        <script src="{{ asset('/z-alert/js/alertify.min.js') }}"></script>
        {{--
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" /> --}}
        {{--
        <script src="https://code.jquery.com/jquery-3.4.1.js"></script> --}}
        <!--Zagvarlag alert-->
        <link rel="stylesheet" href="{{asset('assets/css/5.15.3.all.min.css')}}">
        <link rel="stylesheet" href="{{asset('assets/css/6.4.0.all.min.css')}}">
        <link rel="stylesheet" href="{{asset('assets/css/fonts.css')}}">
        <link rel="stylesheet" href="{{asset('assets/css/bootstrap.min.css')}}">


        <link rel="stylesheet" href="{{ asset('assets/css/all-fontawesome.min.css') }}">
        <link rel="stylesheet" href="{{ asset('assets/css/animate.min.css') }}">
        <link rel="stylesheet" href="{{ asset('assets/css/magnific-popup.min.css') }}">

        <link rel="stylesheet" href="{{asset('assets/css/style.css')}}">

        <link rel="stylesheet" href="{{asset('assets/js/jquery.3.4.1.js')}}">
        <link rel="stylesheet" href="{{asset('assets/js/main.js')}}">
        {{--
        <link rel="stylesheet" href="{{ asset('assets/js/magnific-popup.min.js') }}"> --}}








    </head>

    <body>

        {{-- <div class="preloader">
            <div class="rocket-loader">

                <div class="rocket">
                    <div class="rocket-extras"></div>
                    <div class="jet"><span></span></div>
                </div>
            </div>
        </div> --}}
        <!-- preloader end -->

        <form method="POST" action="{{ route('login') }}">
            @csrf
                <div class="book {{ $errors->any() ? 'open' : '' }}" id="book">
                    <div class="page">
                         <div class="character">
        <img src="{{ asset('images/soldier12.png') }}" alt="soldier">
    </div>
                        <div class="login-box">
                            <h2>Нэвтрэх хэсэг</h2>
 
                                <div class="input-box">

                                <input type="email"
                                        class="form-control @error('email') is-invalid @enderror"
                                        name="email" required value="{{ old('email') }}">
                                    <label>Хэрэглэгчийн нэр</label>

                                    @error('email')
                                        <span class="text-danger">{{ $message }}</span>
                                    @enderror
                                </div>
                        
                                <div class="input-box">
                                    <input type="password" id="password"
                                        class="form-control @error('password') is-invalid @enderror" name="password"
                                        required>
                                    <label>Нууц үг</label>

                                    <!-- 👁 show/hide button -->
                                    <span class="toggle-password" onclick="togglePassword()">👁</span> 

                                    @error('password')
                                        <span class="text-danger">{{ $message }}</span>
                                    @enderror
                                </div>
                                



                                <div class="d-flex align-items-center">
                                    <button class="btn">Нэвтрэх</button>
                                </div>
                            </div>
                            </div>
                        </div>

                            @if (session('error'))
                                <div class="alert alert-danger mt-3">{{ session('error') }}</div>
                            @endif
                     
               
                </div>
        </form>


       
        <script>
            function togglePassword() {
                const input = document.getElementById('password');
                const icon = document.querySelector('.toggle-password');

                if (input.type === 'password') {
                    input.type = 'text';
                    icon.textContent = '❌👁'; // change icon when visible
                } else {
                    input.type = 'password';
                    icon.textContent = '👁'; // change icon when hidden
                }
            }
        </script> 
    </body>


    </html>

    {{-- @endsection --}}